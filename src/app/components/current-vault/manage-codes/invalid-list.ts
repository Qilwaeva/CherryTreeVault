import { ChangeDetectorRef, Component, effect, ElementRef, input, linkedSignal, output, signal, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { CodeService } from '../../../services/code-service';
import { Profile } from '../../../services/supabase.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'invalid-list',
  templateUrl: './invalid-list.html',
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  standalone: true,
})
export class InvalidList {
  user = input.required<User | null>();
  profile = input.required<Profile | null>();

  constructor(
    private readonly codeService: CodeService,
    private readonly formBuilder: FormBuilder
  ) {}
}
