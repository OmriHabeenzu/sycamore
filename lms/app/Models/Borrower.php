<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\SavingsAccount;
use App\Models\Contribution;
use App\Models\MemberShare;

class Borrower extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'borrower_no', 'first_name', 'last_name', 'email',
        'phone', 'dob', 'gender', 'national_id', 'address', 'city', 'photo',
        'status', 'employment_status', 'employer', 'occupation', 'monthly_income',
        'monthly_savings_commitment', 'referred_by', 'notes', 'created_by',
    ];

    protected $casts = [
        'dob' => 'date',
        'monthly_income' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function nextOfKin()
    {
        return $this->hasMany(NextOfKin::class);
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'entity');
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function savings()
    {
        return $this->hasMany(SavingsAccount::class);
    }

    public function contributions()
    {
        return $this->hasMany(Contribution::class);
    }

    public function shares()
    {
        return $this->hasMany(MemberShare::class);
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_members')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
