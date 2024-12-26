<script lang="ts">
    let { message } = $props<{
        message: {
            server_date: string;
            phone: string;
            message: string;
            dest: string;
        }
    }>();
</script>

<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
    <div class="flex justify-between text-gray-600 text-sm mb-2">
        <span>תאריך: {new Date(message.server_date).toLocaleString()}</span>
        <span>מאת: {message.phone}</span>
    </div>
    <div class="text-gray-800">
        {message.message}
    </div>
    <div class="mt-2 text-gray-600 text-sm flex justify-between">
        <span>נשלח אל: {message.dest}</span>
    </div>
</div>
