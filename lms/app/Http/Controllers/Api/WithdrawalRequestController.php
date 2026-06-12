<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavingsAccount;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WithdrawalRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = WithdrawalRequest::where('company_id', $request->user()->company_id)
            ->with(['borrower', 'savingsAccount'])
            ->orderByDesc('created_at');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json(['data' => $query->paginate(20)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'savings_account_id' => 'required|exists:savings_accounts,id',
            'amount'             => 'required|numeric|min:1',
            'reason'             => 'nullable|string|max:500',
        ]);

        $account = SavingsAccount::findOrFail($data['savings_account_id']);

        // Members can only request withdrawals from their own accounts
        if ($request->user()->role === 'member') {
            $borrower = $request->user()->borrower;
            if (!$borrower || $account->borrower_id !== $borrower->id) {
                abort(403, 'You can only withdraw from your own savings account.');
            }
        }

        if ($account->balance < $data['amount']) {
            return response()->json(['message' => 'Insufficient balance.'], 422);
        }

        // Check no other pending request on same account
        $pending = WithdrawalRequest::where('savings_account_id', $account->id)
            ->where('status', 'pending')->exists();

        if ($pending) {
            return response()->json(['message' => 'A withdrawal request is already pending for this account.'], 422);
        }

        $wr = WithdrawalRequest::create([
            'company_id'         => $request->user()->company_id ?? $account->company_id,
            'borrower_id'        => $account->borrower_id,
            'savings_account_id' => $account->id,
            'amount'             => $data['amount'],
            'reason'             => $data['reason'] ?? null,
            'status'             => 'pending',
        ]);

        return response()->json($wr->load(['borrower', 'savingsAccount']), 201);
    }

    public function approve(Request $request, WithdrawalRequest $withdrawalRequest)
    {
        $this->checkCompany($request, $withdrawalRequest);

        if ($withdrawalRequest->status !== 'pending') {
            return response()->json(['message' => 'Request already reviewed.'], 422);
        }

        DB::beginTransaction();
        try {
            $account = $withdrawalRequest->savingsAccount;

            if ($account->balance < $withdrawalRequest->amount) {
                return response()->json(['message' => 'Insufficient balance.'], 422);
            }

            // Deduct from savings
            $account->decrement('balance', $withdrawalRequest->amount);

            $account->transactions()->create([
                'type'             => 'withdrawal',
                'amount'           => $withdrawalRequest->amount,
                'balance_after'    => $account->fresh()->balance,
                'notes'            => 'Withdrawal request approved',
                'reference'        => 'WR-' . $withdrawalRequest->id,
                'transaction_date' => now()->toDateString(),
                'created_by'       => $request->user()->id,
            ]);

            $withdrawalRequest->update([
                'status'       => 'approved',
                'reviewed_by'  => $request->user()->id,
                'reviewed_at'  => now(),
                'review_notes' => $request->review_notes,
            ]);

            DB::commit();
            return response()->json($withdrawalRequest->load(['borrower', 'savingsAccount', 'reviewer']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to process withdrawal.'], 500);
        }
    }

    public function reject(Request $request, WithdrawalRequest $withdrawalRequest)
    {
        $this->checkCompany($request, $withdrawalRequest);

        if ($withdrawalRequest->status !== 'pending') {
            return response()->json(['message' => 'Request already reviewed.'], 422);
        }

        $withdrawalRequest->update([
            'status'       => 'rejected',
            'reviewed_by'  => $request->user()->id,
            'reviewed_at'  => now(),
            'review_notes' => $request->review_notes,
        ]);

        return response()->json($withdrawalRequest->load(['borrower', 'savingsAccount', 'reviewer']));
    }

    private function checkCompany(Request $request, WithdrawalRequest $wr): void
    {
        if ($wr->company_id !== $request->user()->company_id) abort(403);
    }
}
