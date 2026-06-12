<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanProduct;
use App\Models\SavingsAccount;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    private function borrower(Request $request)
    {
        $borrower = $request->user()->borrower;
        if (!$borrower) abort(403, 'No member profile linked.');
        return $borrower;
    }

    public function dashboard(Request $request)
    {
        $borrower = $this->borrower($request);
        $borrower->load(['loans', 'savings']);

        $activeLoans  = $borrower->loans->where('status', 'active');
        $totalSavings = $borrower->savings->sum('balance');
        $nextPayment  = null;

        foreach ($activeLoans as $loan) {
            $due = $loan->schedule()
                ->whereIn('status', ['pending', 'partial', 'overdue'])
                ->orderBy('due_date')
                ->first();
            if ($due && (!$nextPayment || $due->due_date < $nextPayment->due_date)) {
                $nextPayment = $due;
            }
        }

        // Max loan the member can apply for (3× savings)
        $maxLoanAllowed = (float) $totalSavings * 3;

        return response()->json([
            'member' => [
                'id'          => $borrower->id,
                'name'        => $borrower->first_name . ' ' . $borrower->last_name,
                'borrower_no' => $borrower->borrower_no,
                'phone'       => $borrower->phone,
                'status'      => $borrower->status,
            ],
            'savings_balance'   => (float) $totalSavings,
            'max_loan_allowed'  => $maxLoanAllowed,
            'active_loans'      => $activeLoans->count(),
            'total_loans'       => $borrower->loans->count(),
            'next_payment'      => $nextPayment ? [
                'amount'   => $nextPayment->total_due,
                'due_date' => $nextPayment->due_date,
                'status'   => $nextPayment->status,
            ] : null,
        ]);
    }

    public function loans(Request $request)
    {
        $borrower = $this->borrower($request);
        $loans = $borrower->loans()->with(['loanProduct', 'schedule' => function ($q) {
            $q->orderBy('due_date');
        }])->orderByDesc('created_at')->get();

        return response()->json(['data' => $loans]);
    }

    public function applyLoan(Request $request)
    {
        $borrower = $this->borrower($request);

        $data = $request->validate([
            'loan_product_id'  => 'required|exists:loan_products,id',
            'principal_amount' => 'required|numeric|min:1',
            'term'             => 'required|integer|min:1',
            'notes'            => 'nullable|string|max:500',
        ]);

        $product = LoanProduct::where('id', $data['loan_product_id'])
            ->where('company_id', $request->user()->company_id)
            ->where('is_active', true)
            ->firstOrFail();

        // 3× savings limit
        $savingsBalance = SavingsAccount::where('borrower_id', $borrower->id)
            ->where('company_id', $request->user()->company_id)
            ->sum('balance');
        $maxAllowed = (float) $savingsBalance * 3;

        if ($savingsBalance > 0 && $data['principal_amount'] > $maxAllowed) {
            return response()->json([
                'message'     => 'Amount exceeds your 3× savings limit. Maximum allowed: K' . number_format($maxAllowed, 2),
                'max_allowed' => $maxAllowed,
            ], 422);
        }

        if ($product->max_amount && $data['principal_amount'] > $product->max_amount) {
            return response()->json([
                'message' => 'Amount exceeds the product maximum of K' . number_format($product->max_amount, 2),
            ], 422);
        }

        if ($product->min_amount && $data['principal_amount'] < $product->min_amount) {
            return response()->json([
                'message' => 'Amount is below the product minimum of K' . number_format($product->min_amount, 2),
            ], 422);
        }

        $companyId = $request->user()->company_id;
        $last      = Loan::where('company_id', $companyId)->orderBy('id', 'desc')->first();
        $next      = $last ? ((int) ltrim(substr($last->loan_no, 3), '0') + 1) : 1;
        $loanNo    = 'LN-' . str_pad($next, 5, '0', STR_PAD_LEFT);

        $loan = Loan::create([
            'company_id'          => $companyId,
            'loan_no'             => $loanNo,
            'borrower_id'         => $borrower->id,
            'loan_product_id'     => $product->id,
            'principal_amount'    => $data['principal_amount'],
            'interest_rate'       => $product->interest_rate,
            'interest_method'     => $product->interest_method,
            'repayment_frequency' => $product->repayment_frequency,
            'term'                => $data['term'],
            'term_unit'           => $product->term_unit,
            'application_date'    => now()->toDateString(),
            'notes'               => $data['notes'] ?? null,
            'status'              => 'pending',
        ]);

        return response()->json($loan->load('loanProduct'), 201);
    }

    public function myWithdrawalRequests(Request $request)
    {
        $borrower = $this->borrower($request);
        $requests = WithdrawalRequest::where('borrower_id', $borrower->id)
            ->with('savingsAccount')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $requests]);
    }

    public function savings(Request $request)
    {
        $borrower = $this->borrower($request);
        $savings  = $borrower->savings()->with(['transactions' => function ($q) {
            $q->orderByDesc('transaction_date')->limit(20);
        }])->get();

        return response()->json(['data' => $savings]);
    }

    public function contributions(Request $request)
    {
        $borrower = $this->borrower($request);
        $contributions = $borrower->contributions()->orderByDesc('contribution_date')->get();

        return response()->json(['data' => $contributions]);
    }

    public function shares(Request $request)
    {
        $borrower = $this->borrower($request);
        $shares   = $borrower->shares()->first();

        return response()->json(['data' => $shares]);
    }
}
