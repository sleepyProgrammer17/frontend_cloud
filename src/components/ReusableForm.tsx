import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, UploadCloud, FileText } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType =
  | "text"
  | "number"
  | "email"
  | "date"
  | "datetime-local"
  | "textarea"
  | "select"
  | "checkbox"
  | "file"
  | "image";

/**
 * "create" — blank editable form with a submit button
 * "update" — prefilled editable form with a submit button
 * "view"   — read-only display, no submit button
 */
export type FormMode = "create" | "update" | "view";

interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  options?: SelectOption[]; // for "select"
  accept?: string;           // for "file"
  required?: boolean;
  /**
   * Grid column span.
   * 1 = half-width (default), 2 = full-width
   */
  colSpan?: 1 | 2;
}

export type FormValues = Record<
  string,
  string | number | boolean | File | null
>;

export interface ResponsiveFormProps {
  title?: string;
  fields?: FormField[];
  onSubmit?: (data: FormValues) => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  defaultValues?: FormValues;
  /** Controls behaviour. Defaults to "create" */
  mode?: FormMode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function displayValue(
  value: FormValues[string],
  type: FieldType
): string {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "checkbox") return value ? "Yes" : "No";
  if (value instanceof File) return value.name;
  return String(value);
}

// ─── File Upload Field ────────────────────────────────────────────────────────

interface FileUploadFieldProps {
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  value: File | null;
  onChange: (name: string, file: File | null) => void;
  readOnly?: boolean;
}

function FileUploadField({
  name,
  label,
  accept,
  required,
  value,
  onChange,
  readOnly = false,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.files?.[0] ?? null);
  };

  const handleClear = () => {
    onChange(name, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (readOnly) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm py-2 px-3 rounded-md bg-muted/50 border border-border min-h-9 text-muted-foreground">
          {value instanceof File ? value.name : "—"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>

      {value instanceof File ? (
        // ── Selected state: show filename + cancel button ──────────────────
        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/50">
          <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{value.name}</span>
          <button
            type="button"
            onClick={handleClear}
            aria-label="Remove file"
            className="shrink-0 rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // ── Empty state: styled drop-zone trigger ──────────────────────────
        <label
          htmlFor={`file-upload-${name}`}
          className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50 text-muted-foreground text-sm transition-colors"
        >
          <UploadCloud className="w-6 h-6" />
          <span>Click to upload file</span>
          <input
            id={`file-upload-${name}`}
            ref={inputRef}
            type="file"
            accept={accept}
            required={required}
            className="sr-only"
            onChange={handleFile}
          />
        </label>
      )}
    </div>
  );
}

// ─── Image Preview Field ───────────────────────────────────────────────────────

interface ImagePreviewFieldProps {
  name: string;
  label: string;
  required?: boolean;
  value: File | null;
  onChange: (name: string, file: File | null) => void;
  readOnly?: boolean;
}

function ImagePreviewField({
  name,
  label,
  required,
  value,
  onChange,
  readOnly = false,
}: ImagePreviewFieldProps & { value: File | string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (typeof value === "string") {
      setPreview(value);
      return;
    }
    setPreview(null);
  }, [value]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.files?.[0] ?? null);
  };

  const handleClear = () => {
    onChange(name, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>

      {preview ? (
        <div className="relative w-full rounded-md overflow-hidden border border-border group">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain bg-muted"
          />

          {!readOnly && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-background/80 hover:bg-background border border-border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <p className="text-xs text-muted-foreground px-2 py-1 truncate border-t border-border bg-muted/50">
            {value instanceof File ? value.name : "Image preview"}
          </p>
        </div>
      ) : readOnly ? (
        <span className="text-sm py-2 px-3 rounded-md bg-muted/50 border border-border min-h-9 text-muted-foreground">
          —
        </span>
      ) : (
        <label
          htmlFor={`image-upload-${name}`}
          className="flex flex-col items-center justify-center gap-2 w-full h-36 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50 text-muted-foreground text-sm"
        >
          <UploadCloud className="w-6 h-6" />
          Upload Image
          <input
            id={`image-upload-${name}`}
            ref={inputRef}
            type="file"
            accept="image/*"
            required={required}
            className="sr-only"
            onChange={handleFile}
          />
        </label>
      )}
    </div>
  );
}

// ─── Single Field Renderer ────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FormField;
  formData: FormValues;
  readOnly: boolean;
  handleChange: (name: string, value: FormValues[string]) => void;
  autoResize: (el: HTMLTextAreaElement | null) => void;
}

function TextareaField({
  name,
  required,
  value,
  handleChange,
  autoResize,
}: {
  name: string;
  required?: boolean;
  value: string;
  handleChange: (name: string, value: string) => void;
  autoResize: (el: HTMLTextAreaElement | null) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    autoResize(ref.current);
  }, [value, autoResize]);

  return (
    <Textarea
      ref={ref}
      required={required}
      value={value}
      className="resize-none overflow-hidden text-justify"
      onChange={(e) => handleChange(name, e.target.value)}
    />
  );
}

function FieldRenderer({
  field,
  formData,
  readOnly,
  handleChange,
  autoResize,
}: FieldRendererProps) {
  const { name, label, type, options, accept, required } = field;

  // ── VIEW mode ─────────────────────────────────────────────────────────────
  if (readOnly && type !== "image" && type !== "file") {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm py-2 px-3 rounded-md bg-muted/50 border border-border min-h-9 break-words">
          {displayValue(formData[name], type)}
        </span>
      </div>
    );
  }

  // ── EDIT mode ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-1">
      {type !== "image" && type !== "file" && (
        <label className="text-sm font-medium">{label}</label>
      )}

      {(type === "text" || type === "email") && (
        <Input
          type={type}
          required={required}
          value={(formData[name] as string) ?? ""}
          onChange={(e) => handleChange(name, e.target.value)}
          className="uppercase"
        />
      )}

      {type === "number" && (
        <Input
          type="number"
          required={required}
          value={formData[name] !== null && formData[name] !== undefined && formData[name] !== "" ? String(formData[name]) : ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              handleChange(name, "");
            } else {
              const parsed = parseFloat(raw);
              handleChange(name, isNaN(parsed) ? "" : parsed);
            }
          }}
          className="uppercase"
        />
      )}

      {(type === "date" || type === "datetime-local") && (
        <Input
          type={type}
          required={required}
          value={(formData[name] as string) ?? ""}
          onChange={(e) => handleChange(name, e.target.value)}
        />
      )}

      {type === "textarea" && (
        <TextareaField
          name={name}
          required={required}
          value={(formData[name] as string) ?? ""}
          handleChange={handleChange}
          autoResize={autoResize}
        />
      )}

      {type === "select" && (
        <Select
          value={formData[name] != null && formData[name] !== "" ? String(formData[name]) : ""}
          onValueChange={(value) => handleChange(name, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {options?.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === "checkbox" && (
        <div className="flex items-center gap-2 py-2">
          <Checkbox
            checked={Boolean(formData[name])}
            onCheckedChange={(checked) =>
              handleChange(name, Boolean(checked))
            }
          />
          <span className="text-sm">Yes</span>
        </div>
      )}

      {/* FILE — now uses FileUploadField with icon + cancel */}
      {type === "file" && (
        <FileUploadField
          name={name}
          label={label}
          accept={accept}
          required={required}
          value={(formData[name] as File | null) ?? null}
          onChange={handleChange}
          readOnly={readOnly}
        />
      )}

      {type === "image" && (
        <ImagePreviewField
          name={name}
          label={label}
          required={required}
          value={(formData[name] as File | null) ?? null}
          onChange={handleChange}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResponsiveForm({
  title,
  fields = [],
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  defaultValues = {},
  mode = "create",
}: ResponsiveFormProps) {
  const [formData, setFormData] = useState<FormValues>(defaultValues);
  const readOnly = mode === "view";

  useEffect(() => {
    setFormData(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleChange = (name: string, value: FormValues[string]) => {
    if (readOnly) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!readOnly) onSubmit?.(formData);
    },
    [readOnly, onSubmit, formData]
  );

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.overflowY = "hidden";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => {
          const spanClass =
            field.colSpan === 2 ? "col-span-1 sm:col-span-2" : "col-span-1";

          return (
            <div key={field.name} className={spanClass}>
              <FieldRenderer
                field={field}
                formData={formData}
                readOnly={readOnly}
                handleChange={handleChange}
                autoResize={autoResize}
              />
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button type="submit" className="flex-1 btn-primary">
            {submitText}
          </Button>
        </div>
      )}
    </form>
  );
}