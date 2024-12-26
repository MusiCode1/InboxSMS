<script>
    import '../app.css';
    const { children } = $props();
</script>

<div dir="rtl" lang="he">
    {@render children()}
</div>

<style>
    :global(html) {
        background-color: #f5f5f5;
    }
</style>
