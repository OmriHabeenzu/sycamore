<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrower;
use App\Models\ChatMessage;
use App\Models\ContactMessage;
use App\Models\News;
use App\Models\NextOfKin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PublicController extends Controller
{
    public function membershipApplication(Request $request)
    {
        $data = $request->validate([
            'full_name'          => 'required|string|max:255',
            'nrc_number'         => 'required|string|max:50',
            'phone'              => 'required|string|max:30',
            'email'              => 'nullable|email|max:255',
            'gender'             => 'nullable|in:male,female,other',
            'dob'                => 'nullable|date',
            'occupation'         => 'required|string|max:255',
            'monthly_income'     => 'nullable|numeric|min:0',
            'monthly_commitment' => 'required|numeric|min:0',
            'nok_name'           => 'required|string|max:255',
            'nok_phone'          => 'required|string|max:30',
            'nok_relationship'   => 'required|string|max:100',
            'referred_by'        => 'required|string|max:255',
            'notes'              => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();
        try {
            $nameParts = explode(' ', trim($data['full_name']));
            $borrower = Borrower::create([
                'company_id'                => 1,
                'borrower_no'               => 'PEND-' . strtoupper(substr(uniqid(), -6)),
                'first_name'                => $nameParts[0],
                'last_name'                 => implode(' ', array_slice($nameParts, 1)) ?: '-',
                'national_id'               => $data['nrc_number'],
                'phone'                     => $data['phone'],
                'email'                     => $data['email'] ?? null,
                'gender'                    => $data['gender'] ?? null,
                'dob'                       => $data['dob'] ?? null,
                'occupation'                => $data['occupation'],
                'monthly_income'            => $data['monthly_income'] ?? null,
                'monthly_savings_commitment'=> $data['monthly_commitment'],
                'referred_by'               => $data['referred_by'],
                'notes'                     => $data['notes'] ?? null,
                'status'                    => 'pending',
            ]);

            NextOfKin::create([
                'borrower_id'  => $borrower->id,
                'name'         => $data['nok_name'],
                'phone'        => $data['nok_phone'],
                'relationship' => $data['nok_relationship'],
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Application submitted successfully. We will contact you within 2 business days.',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to submit application. Please try again.'], 500);
        }
    }

    public function contactMessage(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'nullable|email|max:255',
            'phone'   => 'nullable|string|max:30',
            'message' => 'required|string|max:2000',
        ]);

        ContactMessage::create($data);

        return response()->json(['message' => 'Message received. We will get back to you within 2 business days.'], 201);
    }

    public function newsIndex()
    {
        $news = News::where('status', 'published')
            ->orderByDesc('published_at')
            ->get(['id', 'title', 'tag', 'excerpt', 'published_at']);

        return response()->json(['data' => $news]);
    }

    public function chatSend(Request $request)
    {
        $data = $request->validate([
            'session_id'     => 'required|string|max:100',
            'visitor_name'   => 'nullable|string|max:255',
            'visitor_phone'  => 'nullable|string|max:30',
            'message'        => 'required|string|max:1000',
        ]);

        $msg = ChatMessage::create(array_merge($data, ['sender' => 'visitor']));

        return response()->json(['message_id' => $msg->id], 201);
    }

    public function chatPoll(Request $request, string $sessionId)
    {
        $since = $request->query('since', 0);

        $messages = ChatMessage::where('session_id', $sessionId)
            ->where('id', '>', $since)
            ->orderBy('id')
            ->get(['id', 'message', 'sender', 'created_at']);

        ChatMessage::where('session_id', $sessionId)
            ->where('sender', 'staff')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['data' => $messages]);
    }
}
