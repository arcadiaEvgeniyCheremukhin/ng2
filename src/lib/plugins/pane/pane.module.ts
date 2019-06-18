import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateModule } from '../../template/template.module';
import { PaneTriggerComponent } from './pane-trigger.component';
import { PaneComponent } from './pane.component';

@NgModule({
	declarations: [
		PaneTriggerComponent,
		PaneComponent,
	],
	exports: [
		PaneTriggerComponent,
		PaneComponent,
	],
	imports: [
		CommonModule,
		TemplateModule
	]
})
export class PaneModule { }
