<script setup lang="ts">
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";

const { state, homePath } = useWorkspaceStore();

navigateTo(homePath(state.lastWorkspaceId), { replace: true });
</script>
