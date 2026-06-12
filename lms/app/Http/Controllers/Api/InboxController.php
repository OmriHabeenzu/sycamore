<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class InboxController extends Controller
{
    // ── Contact Messages ──────────────────────────────────────────
    public function contactIndex()
    {
        return response()->json(
            ContactMessage::orderByDesc('created_at')->paginate(30)
        );
    }

    public function contactShow(ContactMessage $contactMessage)
    {
        $contactMessage->update(['status' => 'read']);
        return response()->json($contactMessage);
    }

    public function contactReply(Request $request, ContactMessage $contactMessage)
    {
        $data = $request->validate(['reply' => 'required|string|max:2000']);
        $contactMessage->update([
            'reply'       => $data['reply'],
            'status'      => 'replied',
            'replied_at'  => now(),
        ]);
        return response()->json($contactMessage);
    }

    public function contactDestroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();
        return response()->json(null, 204);
    }

    // ── Chat ──────────────────────────────────────────────────────
    public function chatSessions()
    {
        $sessions = ChatMessage::selectRaw('session_id, visitor_name, visitor_phone, MAX(created_at) as last_message, SUM(CASE WHEN sender="visitor" AND is_read=0 THEN 1 ELSE 0 END) as unread_count')
            ->groupBy('session_id', 'visitor_name', 'visitor_phone')
            ->orderByDesc('last_message')
            ->get();

        return response()->json(['data' => $sessions]);
    }

    public function chatThread(string $sessionId)
    {
        $messages = ChatMessage::where('session_id', $sessionId)
            ->orderBy('id')
            ->get();

        ChatMessage::where('session_id', $sessionId)
            ->where('sender', 'visitor')
            ->update(['is_read' => true]);

        return response()->json(['data' => $messages]);
    }

    public function chatReply(Request $request, string $sessionId)
    {
        $data = $request->validate(['message' => 'required|string|max:1000']);

        $session = ChatMessage::where('session_id', $sessionId)->first();

        $msg = ChatMessage::create([
            'session_id'    => $sessionId,
            'visitor_name'  => $session?->visitor_name,
            'visitor_phone' => $session?->visitor_phone,
            'message'       => $data['message'],
            'sender'        => 'staff',
            'is_read'       => true,
        ]);

        return response()->json($msg, 201);
    }
}
