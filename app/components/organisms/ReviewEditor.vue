<template>
  <div class="border border-muted rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div
      class="flex flex-wrap items-center gap-1 p-2 border-b border-muted bg-muted">
      <TobiButton
        variant="ghost"
        size="xs"
        :class="{ 'bg-primary/20': editor?.isActive('bold') }"
        @click="editor?.chain().focus().toggleBold().run()">
        <TobiIcon name="i-lucide-bold" class="w-4 h-4" />
      </TobiButton>
      <TobiButton
        variant="ghost"
        size="xs"
        :class="{ 'bg-primary/20': editor?.isActive('italic') }"
        @click="editor?.chain().focus().toggleItalic().run()">
        <TobiIcon name="i-lucide-italic" class="w-4 h-4" />
      </TobiButton>
      <TobiButton
        variant="ghost"
        size="xs"
        :class="{ 'bg-primary/20': editor?.isActive('underline') }"
        @click="editor?.chain().focus().toggleUnderline().run()">
        <TobiIcon name="i-lucide-underline" class="w-4 h-4" />
      </TobiButton>
      <TobiButton
        variant="ghost"
        size="xs"
        :class="{ 'bg-primary/20': editor?.isActive('strike') }"
        @click="editor?.chain().focus().toggleStrike().run()">
        <TobiIcon name="i-lucide-strikethrough" class="w-4 h-4" />
      </TobiButton>

      <div class="w-px h-5 bg-muted mx-1" />

      <TobiButton
        variant="ghost"
        size="xs"
        :class="{ 'bg-primary/20': editor?.isActive('bulletList') }"
        @click="editor?.chain().focus().toggleBulletList().run()">
        <TobiIcon name="i-lucide-list" class="w-4 h-4" />
      </TobiButton>
      <TobiButton
        variant="ghost"
        size="xs"
        :class="{ 'bg-primary/20': editor?.isActive('orderedList') }"
        @click="editor?.chain().focus().toggleOrderedList().run()">
        <TobiIcon name="i-lucide-list-ordered" class="w-4 h-4" />
      </TobiButton>

      <div class="w-px h-5 bg-muted mx-1" />

      <TobiButton
        variant="ghost"
        size="xs"
        :class="{ 'bg-primary/20': editor?.isActive('blockquote') }"
        @click="editor?.chain().focus().toggleBlockquote().run()">
        <TobiIcon name="i-lucide-quote" class="w-4 h-4" />
      </TobiButton>
      <TobiButton
        variant="ghost"
        size="xs"
        @click="editor?.chain().focus().setHorizontalRule().run()">
        <TobiIcon name="i-lucide-minus" class="w-4 h-4" />
      </TobiButton>

      <div class="w-px h-5 bg-muted mx-1" />

      <TobiButton
        variant="ghost"
        size="xs"
        :disabled="!editor?.can().undo()"
        @click="editor?.chain().focus().undo().run()">
        <TobiIcon name="i-lucide-undo" class="w-4 h-4" />
      </TobiButton>
      <TobiButton
        variant="ghost"
        size="xs"
        :disabled="!editor?.can().redo()"
        @click="editor?.chain().focus().redo().run()">
        <TobiIcon name="i-lucide-redo" class="w-4 h-4" />
      </TobiButton>
    </div>

    <!-- Editor Content -->
    <EditorContent
      :editor="editor"
      class="prose prose-sm max-w-none p-4 min-h-32 focus:outline-none" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";

interface Props {
  modelValue: string;
  placeholder?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Nhập nội dung...",
  loading: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    Link.configure({
      openOnClick: false,
    }),
  ],
  editorProps: {
    attributes: {
      class: "focus:outline-none min-h-32",
    },
  },
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value || "");
    }
  }
);

onUnmounted(() => {
  editor.value?.destroy();
});
</script>

<style>
.ProseMirror {
  min-height: 128px;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-muted);
  pointer-events: none;
  height: 0;
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.ProseMirror ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

.ProseMirror blockquote {
  border-left: 3px solid var(--color-muted);
  padding-left: 1rem;
  margin-left: 0;
  font-style: italic;
}
</style>
