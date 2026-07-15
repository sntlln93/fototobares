<?php

declare(strict_types=1);

namespace App\Http\Requests\BO;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Rules\VariantSelection;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateDetailVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'detail_id' => ['required', 'integer'],
            'variant' => ['required', 'array'],
        ];
    }

    /**
     * The selection is validated against the detail's own product
     * definitions, which can only be resolved once detail_id is known —
     * addRules must run here, not in an after() hook.
     */
    public function withValidator(Validator $validator): void
    {
        /** @var mixed $detailId */
        $detailId = $this->input('detail_id');

        if (! is_numeric($detailId)) {
            return;
        }

        /** @var Order $order */
        $order = $this->route('order');

        /** @var OrderDetail|null $detail */
        $detail = $order->details()->with('product')->find((int) $detailId);

        if ($detail === null) {
            return;
        }

        $definitions = $detail->product->variants ?? [];

        if (empty($definitions)) {
            return;
        }

        $validator->addRules([
            'variant' => [new VariantSelection($definitions)],
        ]);
    }
}
