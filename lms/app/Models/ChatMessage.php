<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = ['session_id', 'visitor_name', 'visitor_phone', 'message', 'sender', 'is_read'];

    protected $casts = ['is_read' => 'boolean'];
}
