import { Component, OnInit } from '@angular/core';
import { TagsService } from '../services/tags.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-config-categorie',
  templateUrl: './config-categorie.component.html',
  styleUrls: ['./config-categorie.component.scss']
})
export class ConfigCategorieComponent  implements OnInit {
  form!: FormGroup;
  tags: any[] = [];
  isCreateTagVisible: boolean = false;
  selectedTag:number = 0 ;

  constructor(
    private fb: FormBuilder,
    private tagsService: TagsService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      tag_label: [''],
    });
    this.fetchTags();
  }

  private fetchTags() {
    this.tagsService.getTags().subscribe(
      data => {
        this.tags = data;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }

  toggleCreateTag () {
    this.isCreateTagVisible = !this.isCreateTagVisible;
  }
 untoggleCreateTag () {
    this.selectedTag=0 ;
  }
  createTag () {
    const formData = this.form.value;
    this.tagsService.createTag(formData).subscribe(
      response => {
        console.log('Successfully:', response);
        this.form.reset();
        this.fetchTags();
        this.isCreateTagVisible = !this.isCreateTagVisible;
      },
      error => {
        console.error('Erreur:', error);
      }
    );
  }
}
