<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WelfareContribution extends Model
{
    protected $fillable = [
        'company_id', 'borrower_id', 'amount', 'period',
        'payment_method', 'reference', 'recorded_by', 'contribution_date',
    ];

    protected $casts = ['amount' => 'decimal:2', 'contribution_date' => 'date'];

    public function borrower()   { return $this->belongsTo(Borrower::class); }
    public function recorder()   { return $this->belongsTo(User::class, 'recorded_by'); }
}
