<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
            'order_details.*.variant' => ['sometimes', 'array'],
            'order_details.*.variant.orientation' => ['required_with:order_details.*.variant', 'string', 'in:horizontal,vertical'], // Adjust values as needed
            'order_details.*.variant.photo_type' => ['required_with:order_details.*.variant', 'string', 'in:individual,grupo'], // Adjust values as needed
            'order_details.*.variant.background' => ['required_with:order_details.*.variant', 'string'],
            'order_details.*.variant.color' => ['required_with:order_details.*.variant', 'string'],
        ];
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
     *         variant?: array{
     *             orientation?: string,
     *             photo_type?: string,
     *             background?: string,
     *             color?: string
     *         }
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
         *         variant?: array{
         *             orientation?: string,
         *             photo_type?: string,
         *             background?: string,
         *             color?: string
         *         }
         *     }>
         * }
         */
        $validated = parent::validated($key, $default);

        return $validated;
    }
}
