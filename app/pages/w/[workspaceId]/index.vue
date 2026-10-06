<script setup lang="ts">
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";

const route = useRoute();
const { homePath } = useWorkspaceStore();

navigateTo(homePath(String(route.params.workspaceId)), { replace: true });
</script>
