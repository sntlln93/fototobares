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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('child_name')->nullable();
            $table->boolean('attended_photo_session')->nullable();
            $table->foreignId('client_id')
                ->constrained();

            $table->foreignId('classroom_id')
                ->constrained();
            $table->integer('total_price');
            $table->integer('payment_plan');
            $table->date('due_date');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
