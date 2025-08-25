<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required'],
            'phone' => ['required'],

            'classroom_id' => ['required', 'exists:classrooms,id'],
            'total_price' => ['required', 'numeric', 'min:1'],
            'payment_plan' => ['required', 'numeric', 'min:1'],
            'due_date' => ['required', 'date_format:Y-m-d'],

            'order_details' => ['required', 'array'],
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
     *     name: string,
     *     phone: string,
     *     classroom_id: int,
     *     total_price: float,
     *     payment_plan: int,
     *     due_date: string,
     *     order_details: array<int, array{
     *         product_id: int,
     *         note: string,
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
         *     name: string,
         *     phone: string,
         *     classroom_id: int,
         *     total_price: float,
         *     payment_plan: int,
         *     due_date: string,
         *     order_details: array<int, array{
         *         product_id: int,
         *         note: string,
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
