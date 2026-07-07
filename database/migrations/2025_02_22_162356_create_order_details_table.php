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
        Schema::create('order_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained();

            $table->foreignId('product_id')
                ->constrained();

            $table->json('variant')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('production_status_id')->nullable()->constrained();
            $table->timestamp('status_updated_at')->nullable();
            $table->boolean('priority')->default(false);
            $table->timestamp('stock_deducted_at')->nullable();
            $table->string('recycled_to')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_products');
    }
};
