<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Build success response
     *
     * @param mixed $data
     * @param string $message
     * @param int $code
     * @return JsonResponse
     */
    public function successResponse($data, $message = '', $code = 200)
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data'    => $data
        ];

        // If data is a ResourceCollection, Laravel's toArray() might lose links/meta when nested
        // We manually extract them if available
        if ($data instanceof \Illuminate\Http\Resources\Json\ResourceCollection) {
            $resourceResponse = $data->toResponse(request())->getData(true);
            if (isset($resourceResponse['meta']) || isset($resourceResponse['links'])) {
                $response['data'] = [
                    'data'  => $resourceResponse['data'],
                    'links' => $resourceResponse['links'] ?? null,
                    'meta'  => $resourceResponse['meta'] ?? null,
                ];
            }
        }

        return response()->json($response, $code);
    }

    /**
     * Build error response
     *
     * @param string|array $message
     * @param int $code
     * @param array $errors
     * @return JsonResponse
     */
    public function errorResponse($message, $code, $errors = [])
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
