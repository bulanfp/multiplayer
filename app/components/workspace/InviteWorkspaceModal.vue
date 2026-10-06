<template>
  <MpModal id="invite-modal" :is-open="isOpen" size="lg" @close="handleClose">
    <MpModalContent>
      <MpModalHeader>
        Invite people to {{ workspace.name }}
        <MpModalCloseButton />
      </MpModalHeader>
      <MpModalBody>
        <!-- ═════ Invite form ═════ -->
        <MpFlex gap="3" alignItems="flex-start">
          <MpFormControl
            id="invite-emails"
            is-required
            :is-invalid="Boolean(emailError)"
            :class="css({ flex: '1', minW: '0' })"
          >
            <MpFormLabel>Email addresses</MpFormLabel>
            <MpInputTag
              id="invite-emails-input"
              placeholder="name@company.com"
              :data="emails"
              :key-code="['Enter', ',', ' ']"
              :is-invalid-tag="isInvalidTag"
              :is-invalid="Boolean(emailError)"
              :max-row="3"
              @validate="validateTag"
              @input="pendingText = $event"
              @change="handleChange"
            />
            <MpFormErrorMessage>{{ emailError }}</MpFormErrorMessage>
            <MpFormHelpText>
              Separate addresses with a comma or Enter. No email is sent in this prototype.
            </MpFormHelpText>
          </MpFormControl>

          <MpFormControl id="invite-role" :class="css({ w: '140px', flexShrink: '0' })">
            <MpFormLabel>Role</MpFormLabel>
            <MpSelect id="invite-role-select" v-model="role">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </MpSelect>
          </MpFormControl>
        </MpFlex>

        <MpFlex justifyContent="space-between" alignItems="center" gap="4" marginTop="3">
          <MpText size="body-small" color="text.secondary">
            Members can browse and join groups. Admins can also invite people and add agents.
          </MpText>
          <MpButton :class="css({ flexShrink: '0' })" @click="sendInvites">Send invites</MpButton>
        </MpFlex>

        <!-- ═════ Pending invites ═════ -->
        <MpDivider :class="css({ my: '5' })" />
        <MpText weight="semiBold">Pending invites ({{ workspace.invites.length }})</MpText>
        <ul v-if="workspace.invites.length" :class="css({ mt: '2' })">
          <li v-for="invite in workspace.invites" :key="invite.id" :class="inviteRowClass">
            <MpFlex direction="column" minWidth="0" flex="1">
              <MpText is-truncated>{{ invite.email }}</MpText>
              <MpText size="label-small" color="text.secondary">
                {{ invite.role === "admin" ? "Admin" : "Member" }} · Invited by
                {{ getPerson(invite.invitedBy)?.name ?? "someone" }},
                {{ formatDate(invite.invitedAt) }}
              </MpText>
            </MpFlex>
            <MpButton variant="textLink" size="sm" @click="revoke(invite.id, invite.email)">
              Revoke
            </MpButton>
          </li>
        </ul>
        <MpText v-else color="text.secondary" :class="css({ mt: '2' })">
          No pending invites. People you invite show up here until they join.
        </MpText>
      </MpModalBody>
      <MpModalFooter>
        <MpButton variant="secondary" @click="handleClose">Done</MpButton>
      </MpModalFooter>
    </MpModalContent>
    <MpModalOverlay />
  </MpModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  css,
  toast,
  MpButton,
  MpDivider,
  MpFlex,
  MpFormControl,
  MpFormErrorMessage,
  MpFormHelpText,
  MpFormLabel,
  MpInputTag,
  MpModal,
  MpModalBody,
  MpModalCloseButton,
  MpModalContent,
  MpModalFooter,
  MpModalHeader,
  MpModalOverlay,
  MpSelect,
  MpText,
  type DataInterface
} from "@mekari/pixel3";
import { useWorkspaceStore } from "~/composables/useWorkspaceStore";
import { getPerson } from "~/data/people";
import type { Workspace, WorkspaceRole } from "~/data/types";
import { formatDate } from "~/utils/format";

interface InviteWorkspaceModalProps {
  isOpen: boolean;
  workspace: Workspace;
}

const props = defineProps<InviteWorkspaceModalProps>();
const emit = defineEmits<{ close: [] }>();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const { inviteToWorkspace, revokeInvite } = useWorkspaceStore();

const emails = ref<DataInterface[]>([]);
const pendingText = ref("");
const role = ref<WorkspaceRole>("member");
const isInvalidTag = ref(false);
const emailError = ref("");

function validateTag(value: string) {
  isInvalidTag.value = !EMAIL_PATTERN.test(value.trim());
}

function handleChange(data: DataInterface[]) {
  emails.value = data;
  emailError.value = "";
}

function reset() {
  emails.value = [];
  pendingText.value = "";
  role.value = "member";
  emailError.value = "";
}

function handleClose() {
  reset();
  emit("close");
}

function sendInvites() {
  const typed = pendingText.value.trim();
  const addresses = [
    ...emails.value.map((item) => String(item.value).trim()),
    ...(typed ? [typed] : [])
  ];

  if (!addresses.length) {
    emailError.value = "Add at least one email address.";
    return;
  }
  const invalid = addresses.filter((address) => !EMAIL_PATTERN.test(address));
  if (invalid.length) {
    emailError.value = `Check ${invalid.join(", ")}. It doesn't look like an email address.`;
    // The tag input clears its text on blur, so don't keep re-reporting what's no longer there.
    pendingText.value = "";
    return;
  }

  inviteToWorkspace(props.workspace.id, [...new Set(addresses)], role.value);
  toast.notify({
    title: addresses.length > 1 ? `${addresses.length} invites sent` : "Invite sent",
    variant: "success"
  });
  reset();
}

function revoke(inviteId: string, email: string) {
  revokeInvite(props.workspace.id, inviteId);
  toast.notify({ title: `Revoked the invite for ${email}`, variant: "success" });
}

const inviteRowClass = css({
  display: "flex",
  alignItems: "center",
  gap: "4",
  py: "3",
  borderBottomWidth: "1px",
  borderColor: "border.default",
  _last: { borderBottomWidth: "0" }
});
</script>
