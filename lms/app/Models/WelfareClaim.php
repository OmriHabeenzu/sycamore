<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WelfareClaim extends Model
{
    protected $fillable = [
        'company_id', 'borrower_id', 'claim_ref', 'claim_type',
        'beneficiary_name', 'relationship', 'amount_requested', 'amount_approved',
        'reason', 'status', 'reviewed_by', 'reviewed_at', 'review_notes',
    ];

    protected $casts = [
        'reviewed_at'      => 'datetime',
        'amount_requested' => 'decimal:2',
        'amount_approved'  => 'decimal:2',
    ];

    public function borrower()  { return $this->belongsTo(Borrower::class); }
    public function reviewer()  { return $this->belongsTo(User::class, 'reviewed_by'); }
}
