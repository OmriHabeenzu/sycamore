<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $fillable = ['company_id', 'created_by', 'title', 'tag', 'excerpt', 'body', 'status', 'published_at'];

    protected $casts = ['published_at' => 'datetime'];

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
