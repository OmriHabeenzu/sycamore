<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('permissions')->nullable()->after('role');
            $table->foreignId('borrower_id')->nullable()->constrained('borrowers')->nullOnDelete()->after('permissions');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['borrower_id']);
            $table->dropColumn(['permissions', 'borrower_id']);
        });
    }
};
