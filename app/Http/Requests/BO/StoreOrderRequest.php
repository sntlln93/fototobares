<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Models\Product;
use App\Rules\VariantSelection;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;
use Illuminate\Validation\Validator;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],

            'classroom_id' => ['required', 'exists:classrooms,id'],
            'total_price' => ['required', 'numeric', 'min:1'],
            'payment_plan' => ['required', 'numeric', 'min:1'],
            'due_date' => ['required', 'date_format:Y-m-d'],
            'child_name' => ['nullable', 'string'],
            'attended_photo_session' => ['nullable', 'boolean'],
            'draft_id' => ['nullable', 'integer', 'exists:order_drafts,id'],

            'order_details' => ['required', 'array'],
            // Existing rows carry their id on update: details are addressed one
            // by one, since an order may repeat a product
            'order_details.*.id' => ['nullable', 'integer', 'exists:order_details,id'],
            'order_details.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'order_details.*.note' => ['nullable', 'string'],
            'order_details.*.variant' => ['sometimes', 'nullable', 'array'],
        ];
    }

    /**
     * Per-detail variant selection rules depend on the product's own variant
     * definitions, so they can't be static: addRules only works from here,
     * not from a validator after() hook, since rules must exist before the
     * fields they govern are validated.
     */
    public function withValidator(Validator $validator): void
    {
        /** @var array<int, mixed> $orderDetails */
        $orderDetails = $this->input('order_details') ?? [];

        $productIds = collect($orderDetails)
            ->filter(fn ($detail) => is_array($detail) && isset($detail['product_id']))
            ->pluck('product_id')
            ->unique();

        /** @var Collection<int, Product> $products */
        $products = Product::whereIn('id', $productIds)->get(['id', 'variants'])->keyBy('id');

        foreach ($orderDetails as $index => $detail) {
            if (! is_array($detail) || ! isset($detail['product_id'])) {
                continue;
            }

            /** @var int $productId */
            $productId = $detail['product_id'];

            $product = $products->get($productId);
            $definitions = $product->variants ?? [];

            if (empty($definitions)) {
                continue;
            }

            $validator->addRules([
                "order_details.{$index}.variant" => [new VariantSelection($definitions)],
            ]);
        }
    }

    /**
     * Get the validated data as a structured array.
     *
     * @param  string|null  $key
     * @param  mixed  $default
     * @return array{
     *     name: string|null,
     *     phone: string|null,
     *     classroom_id: int,
     *     total_price: float,
     *     payment_plan: int,
     *     due_date: string,
     *     child_name?: string|null,
     *     attended_photo_session?: bool|null,
     *     draft_id?: int|null,
     *     order_details: array<int, array{
     *         id?: int|null,
     *         product_id: int,
     *         note: string|null,
     *         variant?: array<string, string|null>|null
     *     }>
     * }
     */
    public function validated($key = null, $default = null): array
    {
        /** @var array{
         *     name: string|null,
         *     phone: string|null,
         *     classroom_id: int,
         *     total_price: float,
         *     payment_plan: int,
         *     due_date: string,
         *     child_name?: string|null,
         *     attended_photo_session?: bool|null,
         *     draft_id?: int|null,
         *     order_details: array<int, array{
         *         id?: int|null,
         *         product_id: int,
         *         note: string|null,
         *         variant?: array<string, string|null>|null
         *     }>
         * }
         */
        $validated = parent::validated($key, $default);

        return $validated;
    }
}
