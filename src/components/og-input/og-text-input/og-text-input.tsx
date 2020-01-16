import { h, Component, Prop, Event, EventEmitter, Host } from '@stencil/core';

@Component({
  tag: 'og-text-input',
  styleUrl: 'og-text-input.scss',
  shadow: {
    delegatesFocus: false
  }
})
export class OgTextInput {
  private textInput?: HTMLInputElement;

  /**
   * Optional placeholder text if input is empty.
   */
  @Prop()
  public placeholder?: string;

  /**
   * Autofocus component when set.
   */
  @Prop({ mutable: false, reflect: false })
  public autofocus: boolean;

  /**
   * The initial value. Can be updated at runtime.
   */
  @Prop({ mutable: true, reflectToAttr: true })
  public value: string;

  /**
   * Determines, whether the control is disabled or not.
   */
  @Prop()
  public disabled: boolean;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public valueChanged: EventEmitter<string>;

  /**
   * Event is being emitted when input gets focus..
   */
  @Event()
  public focusGained: EventEmitter<FocusEvent>;

  /**
   * Event is being emitted when focus gets lost.
   */
  @Event()
  public focusLost: EventEmitter<FocusEvent>;

  public handleChange(e) {
    this.value = e.target.value;
    this.valueChanged.emit(this.value);
  }

  private focus: boolean = false;

  componentWillLoad() {
    if (this.autofocus) {
      this.focus = true;
    } 
  }

  componentDidLoad() {
    if (this.autofocus && this.focus) {
      setTimeout(() => {
        this.textInput.focus();
        this.focus = false;
      });
    } 
  }

  public render(): HTMLElement {
    return (
      <Host class={{ 'og-form-item__editor': true }}>
        <input type="text"
          ref={ el => this.textInput = el as HTMLInputElement }
          class="og-input__input"
          value={ this.value }
          disabled={ this.disabled }
          onInput={ (event) => this.handleChange(event) }
          onFocus={ (event) => this.focusGained.emit(event) }
          onBlur={ (event) => this.focusLost.emit(event) }
          placeholder={ this.placeholder }
        />
        <div class="og-input__indicator"></div>
      </Host>
    );
  }
}
