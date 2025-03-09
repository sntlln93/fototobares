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
            'payments' => ['required', 'numeric', 'min:1'],
            'due_date' => ['required', 'date_format:Y-m-d'],

            'order_details' => ['required', 'array'],
            'order_details.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'order_details.*.note' => ['required', 'string'],
            'order_details.*.variant' => ['sometimes', 'array'],
            'order_details.*.variant.orientation' => ['required_with:order_details.*.variant', 'string', 'in:horizontal,vertical'], // Adjust values as needed
            'order_details.*.variant.photo_type' => ['required_with:order_details.*.variant', 'string', 'in:individual,grupo'], // Adjust values as needed
            'order_details.*.variant.background' => ['required_with:order_details.*.variant', 'string'],
            'order_details.*.variant.color' => ['required_with:order_details.*.variant', 'string'],
        ];
    }
}
