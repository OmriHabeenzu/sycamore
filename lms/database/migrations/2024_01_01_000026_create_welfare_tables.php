<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('welfare_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('borrower_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('period');           // e.g. "2026-06"
            $table->string('payment_method')->nullable();
            $table->string('reference')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('contribution_date');
            $table->timestamps();

            $table->index(['company_id', 'period']);
            $table->unique(['borrower_id', 'period']);
        });

        Schema::create('welfare_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('borrower_id')->constrained()->cascadeOnDelete();
            $table->string('claim_ref')->unique();
            $table->enum('claim_type', ['bereavement', 'medical', 'emergency', 'other']);
            $table->string('beneficiary_name');  // who the claim is for (could be family)
            $table->string('relationship')->nullable();
            $table->decimal('amount_requested', 15, 2);
            $table->decimal('amount_approved', 15, 2)->nullable();
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected', 'paid'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('review_notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('welfare_claims');
        Schema::dropIfExists('welfare_contributions');
    }
};
