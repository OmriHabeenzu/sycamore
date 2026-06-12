<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrowers', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'inactive', 'suspended'])
                  ->default('active')->after('photo');
            $table->string('occupation')->nullable()->after('employer');
            $table->string('referred_by')->nullable()->after('occupation');
            $table->text('notes')->nullable()->after('referred_by');
            $table->decimal('monthly_savings_commitment', 15, 2)->nullable()->after('monthly_income');
        });
    }

    public function down(): void
    {
        Schema::table('borrowers', function (Blueprint $table) {
            $table->dropColumn(['status', 'occupation', 'referred_by', 'notes', 'monthly_savings_commitment']);
        });
    }
};
