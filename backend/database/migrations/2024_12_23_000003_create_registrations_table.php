<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->foreignId('guardian_id')->constrained('guardians')->onDelete('cascade');
            $table->string('inaanak_name');
            $table->date('inaanak_birthdate');
            $table->string('relationship');
            $table->string('live_photo_path')->nullable();
            $table->string('video_path')->nullable();
            $table->string('qr_code_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'released', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
