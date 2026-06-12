<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','admin','manager','loan_officer','cashier','staff','member') NOT NULL DEFAULT 'staff'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','admin','manager','loan_officer','cashier') NOT NULL DEFAULT 'loan_officer'");
    }
};
