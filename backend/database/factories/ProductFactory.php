<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $costPrice = fake()->randomFloat(2, 0.5, 50);
        $price = $costPrice * fake()->randomFloat(2, 1.2, 2.0); // 20% to 100% markup

        return [
            'name' => fake()->unique()->words(3, true),
            'sku' => fake()->unique()->numerify('SKU-#####'),
            'barcode' => fake()->unique()->ean13(),
            'category_id' => Category::factory(), // Will create a category if not provided
            'price' => $price,
            'cost_price' => $costPrice,
            'discount' => fake()->randomElement([0, 0, 0, 5, 10, 15, 20]),
            'stock' => fake()->numberBetween(0, 500),
            'low_stock_threshold' => fake()->numberBetween(10, 50),
            'description' => fake()->paragraph(),
            'is_active' => fake()->boolean(95),
        ];
    }
}
