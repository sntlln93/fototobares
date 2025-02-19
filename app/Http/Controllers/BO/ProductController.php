<?php

namespace App\Http\Controllers\BO;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(){
        return Inertia::render('products/index', ['products' => ProductResource::collection(Product::paginate(10))]);
    }
}
