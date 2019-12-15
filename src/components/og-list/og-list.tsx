/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, EventEmitter, Event, Watch, State } from '@stencil/core';

@Component({
  tag: 'og-list',
  styleUrl: 'og-list.scss',
  shadow: true
})
export class OgList {

  /**
   * The key of the selected list item
   */
  @Prop({ mutable: true, reflect: true })
  public selected: string | string[];

  @Watch('selected')
  public handleSelectedPropChanged(newValue: string | string[]) {
    if (this.multiselect) {
      // try to parse html encoded string to array
      if (typeof newValue === 'string') {
        newValue = JSON.parse(newValue);
      }
      this.internalSelection = new Set(newValue as string[]);
    } else {
      this.internalSelection = new Set([newValue as string]);
    }
  }

  /**
   * An array of items to choose from
   */
  @Prop()
  public items: any[];

  /**
   * Set the property for the items to define as value. Default: 'key'
   */
  @Prop()
  public keyProperty: string = 'key';

  /**
   * Set the property for the items to define as image url. *Optional* Default: no image
   */
  @Prop()
  public imageUrlProperty?: string;

  /**
   * Set the property for the items to define as label. Default: 'label'
   */
  @Prop()
  public labelProperty: string = 'label';

  /**
   * Set the property for the items to define as value. *Optional* Default: no value
   */
  @Prop()
  public valueProperty: string;

  /**
   * Set the property for the items to define as disabled. Default: 'disabled'
   */
  @Prop()
  public disabledProperty: string = 'disabled';

  /**
   * Set the text that will be displayed if the items array is empty.
   */
  @Prop()
  public emptyListMessage: string = 'No items available';

  /**
   * Enables selection of multiple items
   */
  @Prop()
  public multiselect: boolean;

  /**
   * Enables drag and drop of items.
   */
  @Prop()
  public dragAndDrop: boolean;

  /**
   * Verification function for valid drop target. 
   * @param {event} event
   * @returns {boolean} True, if component is a valid drop target.
   */
  @Prop()
  public allowDropFunc: Function;

  /**
   * Requires a selection of at least one item. If one item is selected it prevents the user from deselecting it
   */
  @Prop()
  public required: boolean;

  /**
   * Determines, whether the control is disabled or not
   */
  @Prop()
  public disabled: boolean;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public itemSelected: EventEmitter<any>;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public itemHovered: EventEmitter<any>;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public itemDragStarted: EventEmitter<any>;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public itemDraggedOver: EventEmitter<any>

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public itemDropped: EventEmitter<any>;

  @State()
  private internalSelection: Set<string> = new Set();

  public componentDidLoad() {
    this.handleSelectedPropChanged(this.selected);
  }

  public listItemHovered(item: any): void {
    if (!this.disabled && !this.isItemDisabled(item)) {
      const value = this.getKeyValue(item);
      this.itemHovered.emit(this.items.find(item => this.getKeyValue(item) === value));
    }
  }

  public listItemSelected(item: any): void {
    if (!this.disabled && !this.isItemDisabled(item)) {
      const value = this.getKeyValue(item);
      if (this.isItemSelected(item)) {
        // deny deselection last item if required flag is set?
        if (this.required && this.internalSelection.size === 1) {
          return;
        }
        if (this.multiselect) {
          // deselect with multiselect means: delete item, update internal state and property value
          this.internalSelection.delete(value);
          this.internalSelection = new Set(this.internalSelection);
          this.selected = Array.from(this.internalSelection);
        } else {
          // deselect without multiselect simply means: empty selection state and property
          this.internalSelection = new Set();
          this.selected = '';
        }
      } else {
        // add selected key to property array and update internal state
        // extend or replace state and property depending on multiselect
        if (this.multiselect) {
          this.selected = [...Array.from(this.internalSelection), value];
          this.internalSelection = new Set(this.selected);
        } else {
          this.internalSelection = new Set([value]);
          this.selected = value;
        }
      }
      // emit new property value
      if (this.multiselect) {
        this.itemSelected.emit(this.items.filter(item => this.internalSelection.has(this.getKeyValue(item))))
      } else {
        this.itemSelected.emit(this.items.find(item => this.getKeyValue(item) === this.selected));
      }
    }
  }

  public onDragStart(event: any, item: any): void {
    if(!this.dragAndDrop) {
      return;
    }

    if (this.disabled || this.isItemDisabled(item)) {
      return; 
    }
    
    event.preventDefault();
    this.itemDragStarted.emit({event: event, item: item});
  }

  public onDrop(event: any): void {
    if (!this.dragAndDrop) {
      return;
    }

    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.itemDropped.emit(event);
  }

  public onDragOver(event: any): void {
    if(!this.dragAndDrop) {
      return;
    }

    if (this.disabled) {
      return;
    }
    
    this.itemDraggedOver.emit(event);
  }

  private hasValidItems(): boolean {
    return Array.isArray(this.items) && this.items.length > 0;
  }

  public isItemSelected(item: any): boolean {
    return this.internalSelection.has(this.getKeyValue(item));
  }

  private isItemDisabled(item: any): boolean {
    return item[this.disabledProperty] || false;
  }

  private getKeyValue(item: any): string {
    return item[this.keyProperty] + '';
  }

  public render(): HTMLElement {
    return <ul class="og-list"
      onDragOver={(ev) => this.onDragOver(ev)}
      onDrop={(ev) => this.onDrop(ev)}>
      {
        !this.hasValidItems()
          ? <og-list-item label={this.emptyListMessage}></og-list-item>
          : this.items.map((item): HTMLElement =>
            <og-list-item
              key={this.getKeyValue(item)}
              draggable={this.dragAndDrop}
              label={item[this.labelProperty]}
              show-image={!!this.imageUrlProperty}
              image={item[this.imageUrlProperty]}
              show-value={!!this.valueProperty}
              value={item[this.valueProperty]}
              is-selected={this.isItemSelected(item)}
              is-disabled={this.isItemDisabled(item)}
              onMouseOver={() => this.listItemHovered(item)}
              onClick={() => this.listItemSelected(item)}
              onDragStart={(ev) => this.onDragStart(ev, item)}>
            </og-list-item>
          )
      }
    </ul>;
  }
}
