import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  products: Product[] = [];
  private productService = inject(ProductService);

  showForm = false;
  editingId: number | null = null;

  form = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 1,
  };
  imageFile: File | null = null;

  ngOnInit() {
    this.load();
  }

  load() {
    this.productService.getAll().subscribe(p => this.products = p);
  }

  onFileChange(e: any) {
    this.imageFile = e.target.files[0];
  }

  openCreate() {
    this.editingId = null;
    this.form = { name: '', description: '', price: 0, stock: 0, category: 1 };
    this.imageFile = null;
    this.showForm = true;
  }

  openEdit(p: Product) {
    this.editingId = p.id;
    this.form = {
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
    };
    this.showForm = true;
  }

  save() {
    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('description', this.form.description);
    fd.append('price', String(this.form.price));
    fd.append('stock', String(this.form.stock));
    fd.append('category', String(this.form.category));
    if (this.imageFile) fd.append('image', this.imageFile);

    const req = this.editingId
      ? this.productService.update(this.editingId, fd)
      : this.productService.create(fd);

    req.subscribe(() => {
      this.showForm = false;
      this.load();
    });
  }

  delete(id: number) {
    if (confirm('Удалить товар?')) {
      this.productService.delete(id).subscribe(() => this.load());
    }
  }
}