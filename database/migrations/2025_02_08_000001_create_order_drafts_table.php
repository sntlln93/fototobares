<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_drafts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained();
            $table->string('child_name')->nullable();
            $table->string('client_name')->nullable();
            $table->string('client_phone')->nullable();
            $table->boolean('attended_photo_session')->nullable();
            $table->integer('total_price')->default(0);
            $table->integer('payment_plan')->default(1);
            $table->date('due_date')->nullable();
            $table->json('products')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_drafts');
    }
};
