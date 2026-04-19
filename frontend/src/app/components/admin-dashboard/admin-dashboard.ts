import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category } from '../../services/product';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  private productService = inject(ProductService);

  showForm = false;
  showCatForm = false;
  editingId: number | null = null;
  newCatName = '';

  form = { name: '', description: '', price: 0, stock: 0, category: 0 };
  imageFile: File | null = null;

  ngOnInit() {
    this.load();
    this.loadCategories();
  }

  load() {
    this.productService.getAll().subscribe(p => this.products = p);
  }

  loadCategories() {
    this.productService.getAllCategories().subscribe(c => {
      this.categories = c;
      if (c.length > 0) this.form.category = c[0].id;
    });
  }

  onFileChange(e: any) { this.imageFile = e.target.files[0]; }

  openCreate() {
    this.editingId = null;
    this.form = { name: '', description: '', price: 0, stock: 0, category: this.categories[0]?.id || 0 };
    this.imageFile = null;
    this.showForm = true;
  }

  openEdit(p: Product) {
    this.editingId = p.id;
    this.form = { name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category };
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

    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  delete(id: number) {
    if (confirm('Удалить товар?')) {
      this.productService.delete(id).subscribe(() => this.load());
    }
  }

  addCategory() {
    if (!this.newCatName.trim()) return;
    this.productService.createCategory(this.newCatName).subscribe(() => {
      this.newCatName = '';
      this.showCatForm = false;
      this.loadCategories();
    });
  }

  deleteCategory(id: number) {
    if (confirm('Удалить категорию?')) {
      this.productService.deleteCategory(id).subscribe(() => this.loadCategories());
    }
  }

  getCatName(id: number): string {
    return this.categories.find(c => c.id === id)?.name || '—';
  }
}