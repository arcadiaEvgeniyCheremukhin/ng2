import { Component, Optional, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { RootService } from 'ng2-qgrid/infrastructure/component/root.service';
import { PluginComponent } from '../plugin.component';
import { ColumnChooserView } from 'ng2-qgrid/plugin/column-chooser/column.chooser.view';

const ColumnChooserName = 'qGridColumnChooser';

@Component({
	selector: 'q-grid-column-chooser',
	templateUrl: './column-chooser.component.html'
})
export class ColumnChooserComponent extends PluginComponent implements OnInit, OnDestroy {
	@Input('canAggregate') columnChooserCanAggregate: boolean;
	@Output('submit') submitEvent = new EventEmitter<any>();
	@Output('cancel') cancelEvent = new EventEmitter<any>();

	private columnChooser: ColumnChooserView;

	constructor( @Optional() root: RootService) {
		super(root);

		this.models = ['columnChooser'];

		this.using(this.model.sceneChanged.on(e => {
			if (e.tag.source === 'column.chooser' && e.state.status === 'stop') {
				root.table.view.focus();
			}
		}));
	}

	ngOnInit() {
		const context = {
			name: ColumnChooserName
		};

		this.columnChooser = new ColumnChooserView(this.model, context);
		this.using(this.columnChooser.submitEvent.on(() => this.submitEvent.emit()));
		this.using(this.columnChooser.cancelEvent.on(() => this.cancelEvent.emit()));

		this.context = { $implicit: this.columnChooser };
	}

	ngOnDestroy() {
		this.columnChooser.dispose();
	}
}
