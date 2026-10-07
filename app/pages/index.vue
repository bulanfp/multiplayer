<script setup lang="ts">
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";

// One shared space: the app opens on your chat with Airene.
const { defaultWorkspace, homePath } = useWorkspaceStore();

const workspace = defaultWorkspace();
if (workspace) navigateTo(homePath(workspace.id), { replace: true });
</script>
