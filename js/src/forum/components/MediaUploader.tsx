import app from 'flarum/forum/app';
import { uploadFile } from '../../common/api';
import SocialState from '../SocialState';

export default class MediaUploader {
  uploading = false;
  progress = 0;
  error: string | null = null;
  input: HTMLInputElement | null = null;
  private pending = 0;

  maxAttachments(): number {
    const configured = Number(SocialState.config?.media?.maxAttachments);

    if (Number.isFinite(configured) && configured >= 0) {
      return Math.floor(configured);
    }

    return 6;
  }

  handleFiles(files: FileList | File[], count = 0, onUploading?: (value: boolean) => void, onUploaded?: (item: any) => void): void {
    if (!files || !files.length) return;

    const max = this.maxAttachments();
    const remaining = Math.max(0, max - count - this.pending);

    if (!remaining) {
      this.error = app.translator.trans('cengizkemec-social.forum.media.limit', { max }) as string;
      m.redraw();
      return;
    }

    const selected = Array.from(files).slice(0, remaining);

    if (!selected.length) return;

    this.pending += selected.length;
    this.uploading = true;
    this.progress = 0;
    this.error = null;
    onUploading?.(true);

    let done = 0;

    const next = () => {
      done++;
      this.pending = Math.max(0, this.pending - 1);
      this.progress = Math.round((done / selected.length) * 100);

      if (done >= selected.length && this.pending === 0) {
        this.uploading = false;
        onUploading?.(false);
        m.redraw();
      }
    };

    selected.forEach((file) => {
      uploadFile('/social/media', file, (percent) => {
        this.progress = percent;
        m.redraw();
      })
        .then((response: any) => {
          onUploaded?.(response.data);
          m.redraw();
        })
        .catch((error: any) => {
          this.error = error.message;
        })
        .finally(next);
    });
  }

  upload(files: FileList | File[], parent: any): void {
    this.handleFiles(files, parent.attrs.count || 0, parent.attrs.onUploading, parent.attrs.onUploaded);
  }

  view(vnode: any): any {
    const config = SocialState.config?.media || {};
    const accept = (config.allowedMimes || []).join(',');
    const maxMb = Math.max(config.maxImageMb || 10, config.maxVideoMb || 100, config.maxDocumentMb || 20);

    return m('div', {
      className: 'SocialUploader' + (this.uploading ? ' is-uploading' : ''),
      ondragover: (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.add('is-dragging');
      },
      ondragleave: (event: DragEvent) => event.currentTarget.classList.remove('is-dragging'),
      ondrop: (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('is-dragging');
        if (event.dataTransfer?.files) this.upload(event.dataTransfer.files, vnode);
      },
    }, [
      m('input', {
        type: 'file',
        multiple: true,
        accept,
        className: 'SocialUploader-input',
        oncreate: (v: any) => (this.input = v.dom as HTMLInputElement),
        onchange: (event: Event) => {
          const input = event.target as HTMLInputElement;
          if (input.files) this.upload(input.files, vnode);
          input.value = '';
        },
      }),
      m(
        'button',
        {
          type: 'button',
          className: 'Button Button--link SocialUploader-button',
          disabled: this.uploading,
          onclick: (event: Event) => {
            event.preventDefault();
            this.input?.click();
          },
        },
        this.uploading
          ? [m('i', { className: 'fas fa-spinner fa-spin' }), ' ', this.progress + '%']
          : [m('i', { className: 'fas fa-paperclip' }), ' ', app.translator.trans('cengizkemec-social.forum.media.attach')]
      ),
      m('span', { className: 'SocialUploader-hint' }, app.translator.trans('cengizkemec-social.forum.media.hint', { max: maxMb })),
      this.error ? m('span', { className: 'SocialUploader-error' }, this.error) : null,
    ]);
  }
}
