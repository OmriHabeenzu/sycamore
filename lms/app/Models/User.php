<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'company_id', 'name', 'email', 'phone', 'photo', 'password', 'role', 'is_active',
        'permissions', 'borrower_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active'         => 'boolean',
        'permissions'       => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class, 'loan_officer_id');
    }

    public function borrower()
    {
        return $this->belongsTo(Borrower::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    public function isMember(): bool
    {
        return $this->role === 'member';
    }

    public function hasPermission(string $key): bool
    {
        if ($this->isAdmin()) return true;
        return !empty($this->permissions[$key]);
    }
}
