<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WithdrawalRequest extends Model
{
    protected $fillable = [
        'company_id', 'borrower_id', 'savings_account_id',
        'amount', 'reason', 'status', 'reviewed_by', 'reviewed_at', 'review_notes',
    ];

    protected $casts = ['reviewed_at' => 'datetime', 'amount' => 'decimal:2'];

    public function borrower()   { return $this->belongsTo(Borrower::class); }
    public function savingsAccount() { return $this->belongsTo(SavingsAccount::class); }
    public function reviewer()   { return $this->belongsTo(User::class, 'reviewed_by'); }
}
