<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WelfareClaim;
use App\Models\WelfareContribution;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WelfareController extends Controller
{
    // ── Contributions ──────────────────────────────────────────

    public function contributionIndex(Request $request)
    {
        $query = WelfareContribution::where('company_id', $request->user()->company_id)
            ->with('borrower')
            ->orderByDesc('contribution_date');

        if ($request->period) $query->where('period', $request->period);
        if ($request->borrower_id) $query->where('borrower_id', $request->borrower_id);

        return response()->json(['data' => $query->paginate(30)]);
    }

    public function contributionStore(Request $request)
    {
        $data = $request->validate([
            'borrower_id'       => 'required|exists:borrowers,id',
            'amount'            => 'required|numeric|min:1',
            'period'            => 'required|string|regex:/^\d{4}-\d{2}$/',
            'payment_method'    => 'nullable|string|max:50',
            'reference'         => 'nullable|string|max:100',
            'contribution_date' => 'required|date',
        ]);

        $contrib = WelfareContribution::create(array_merge($data, [
            'company_id'  => $request->user()->company_id,
            'recorded_by' => $request->user()->id,
        ]));

        return response()->json($contrib->load('borrower'), 201);
    }

    public function contributionDestroy(Request $request, WelfareContribution $welfareContribution)
    {
        if ($welfareContribution->company_id !== $request->user()->company_id) abort(403);
        $welfareContribution->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    public function fundSummary(Request $request)
    {
        $companyId = $request->user()->company_id;
        $totalIn   = WelfareContribution::where('company_id', $companyId)->sum('amount');
        $totalOut  = WelfareClaim::where('company_id', $companyId)
            ->whereIn('status', ['approved', 'paid'])->sum('amount_approved');
        $pending   = WelfareClaim::where('company_id', $companyId)->where('status', 'pending')->count();

        return response()->json([
            'total_contributions' => (float) $totalIn,
            'total_disbursed'     => (float) $totalOut,
            'balance'             => (float) ($totalIn - $totalOut),
            'pending_claims'      => $pending,
        ]);
    }

    // ── Claims ─────────────────────────────────────────────────

    public function claimIndex(Request $request)
    {
        $query = WelfareClaim::where('company_id', $request->user()->company_id)
            ->with(['borrower', 'reviewer'])
            ->orderByDesc('created_at');

        if ($request->status) $query->where('status', $request->status);

        return response()->json(['data' => $query->paginate(20)]);
    }

    public function claimStore(Request $request)
    {
        $data = $request->validate([
            'borrower_id'       => 'required|exists:borrowers,id',
            'claim_type'        => 'required|in:bereavement,medical,emergency,other',
            'beneficiary_name'  => 'required|string|max:200',
            'relationship'      => 'nullable|string|max:100',
            'amount_requested'  => 'required|numeric|min:1',
            'reason'            => 'required|string|max:1000',
        ]);

        $ref   = 'WLF-' . strtoupper(Str::random(6));
        $claim = WelfareClaim::create(array_merge($data, [
            'company_id' => $request->user()->company_id,
            'claim_ref'  => $ref,
            'status'     => 'pending',
        ]));

        return response()->json($claim->load('borrower'), 201);
    }

    public function claimReview(Request $request, WelfareClaim $welfareClaim)
    {
        if ($welfareClaim->company_id !== $request->user()->company_id) abort(403);

        $data = $request->validate([
            'status'          => 'required|in:approved,rejected',
            'amount_approved' => 'nullable|numeric|min:0',
            'review_notes'    => 'nullable|string|max:500',
        ]);

        $welfareClaim->update(array_merge($data, [
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]));

        return response()->json($welfareClaim->load(['borrower', 'reviewer']));
    }

    public function claimMarkPaid(Request $request, WelfareClaim $welfareClaim)
    {
        if ($welfareClaim->company_id !== $request->user()->company_id) abort(403);
        if ($welfareClaim->status !== 'approved') {
            return response()->json(['message' => 'Only approved claims can be marked paid.'], 422);
        }
        $welfareClaim->update(['status' => 'paid']);
        return response()->json($welfareClaim->load(['borrower', 'reviewer']));
    }
}
