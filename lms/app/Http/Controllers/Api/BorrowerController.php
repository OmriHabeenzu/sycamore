<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrower;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BorrowerController extends Controller
{
    public function index(Request $request)
    {
        $query = Borrower::where('company_id', $request->user()->company_id)
            ->with('nextOfKin');

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('borrower_no', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'phone'             => 'required|string|max:20',
            'email'             => 'nullable|email|max:100',
            'dob'               => 'nullable|date',
            'gender'            => 'nullable|in:male,female,other',
            'national_id'       => 'nullable|string|max:50',
            'address'           => 'nullable|string|max:255',
            'city'              => 'nullable|string|max:100',
            'employment_status' => 'nullable|in:employed,self_employed,unemployed',
            'employer'          => 'nullable|string|max:100',
            'monthly_income'    => 'nullable|numeric|min:0',
            'next_of_kin'       => 'nullable|array',
            'next_of_kin.*.name'         => 'required|string|max:100',
            'next_of_kin.*.relationship' => 'required|string|max:50',
            'next_of_kin.*.phone'        => 'required|string|max:20',
            'next_of_kin.*.address'      => 'nullable|string|max:255',
        ]);

        $companyId = $request->user()->company_id;

        // Generate borrower_no: BRW-0001
        $last = Borrower::where('company_id', $companyId)
            ->orderBy('id', 'desc')->first();
        $next = $last ? ((int) substr($last->borrower_no, 4)) + 1 : 1;
        $borrowerNo = 'BRW-' . str_pad($next, 4, '0', STR_PAD_LEFT);

        $borrower = Borrower::create(array_merge($validated, [
            'company_id'  => $companyId,
            'borrower_no' => $borrowerNo,
            'created_by'  => $request->user()->id,
        ]));

        if (!empty($validated['next_of_kin'])) {
            $borrower->nextOfKin()->createMany($validated['next_of_kin']);
        }

        return response()->json($borrower->load('nextOfKin'), 201);
    }

    public function show(Request $request, Borrower $borrower)
    {
        $this->authorizeCompany($request, $borrower->company_id);

        return response()->json(
            $borrower->load(['nextOfKin', 'loans.loanProduct', 'documents'])
        );
    }

    public function update(Request $request, Borrower $borrower)
    {
        $this->authorizeCompany($request, $borrower->company_id);

        $validated = $request->validate([
            'first_name'        => 'sometimes|string|max:100',
            'last_name'         => 'sometimes|string|max:100',
            'phone'             => 'sometimes|string|max:20',
            'email'             => 'nullable|email|max:100',
            'dob'               => 'nullable|date',
            'gender'            => 'nullable|in:male,female,other',
            'national_id'       => 'nullable|string|max:50',
            'address'           => 'nullable|string|max:255',
            'city'              => 'nullable|string|max:100',
            'employment_status' => 'nullable|in:employed,self_employed,unemployed',
            'employer'          => 'nullable|string|max:100',
            'monthly_income'    => 'nullable|numeric|min:0',
            'status'            => 'sometimes|in:pending,active,inactive,suspended,rejected',
        ]);

        $generatedPassword = null;

        // Auto-create member portal account when approving
        if (($validated['status'] ?? null) === 'active') {
            $existingUser = User::where('borrower_id', $borrower->id)->first();
            if (!$existingUser) {
                $generatedPassword = strtoupper(Str::random(4)) . rand(100, 999);

                // Use email if not taken, otherwise fall back to phone@sycamore.member
                $memberEmail = $borrower->email;
                if (!$memberEmail || User::where('email', $memberEmail)->exists()) {
                    $memberEmail = preg_replace('/[^a-z0-9]/', '', strtolower($borrower->phone)) . '@sycamore.member';
                }

                User::create([
                    'company_id'  => $borrower->company_id,
                    'borrower_id' => $borrower->id,
                    'name'        => $borrower->first_name . ' ' . $borrower->last_name,
                    'email'       => $memberEmail,
                    'phone'       => $borrower->phone,
                    'password'    => Hash::make($generatedPassword),
                    'role'        => 'member',
                    'is_active'   => true,
                ]);

                $validated['_member_email'] = $memberEmail;
            }
        }

        $borrower->update($validated);

        $response = $borrower->load('nextOfKin')->toArray();
        if ($generatedPassword) {
            $response['generated_password'] = $generatedPassword;
            $response['member_email']        = $validated['_member_email'] ?? $borrower->email;
        }

        return response()->json($response);
    }

    public function destroy(Request $request, Borrower $borrower)
    {
        $this->authorizeCompany($request, $borrower->company_id);

        if ($borrower->loans()->whereIn('status', ['active', 'disbursed'])->exists()) {
            return response()->json(
                ['message' => 'Cannot delete a borrower with active loans.'], 422
            );
        }

        $borrower->delete();

        return response()->json(['message' => 'Borrower deleted.']);
    }

    private function authorizeCompany(Request $request, int $companyId): void
    {
        if ($request->user()->company_id !== $companyId && !$request->user()->isSuperAdmin()) {
            abort(403);
        }
    }
}
