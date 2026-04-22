import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category } from '../../services/product';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, SlicePipe, TranslateModule ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  showForm = false;
  showCatForm = false;
  editingId: number | null = null;
  searchQuery = '';
  newCatName = '';

  form = { name: '', description: '', price: 0, stock: 0, category: 0 };
  imageFile: File | null = null;

  ngOnInit() {
    console.log('AdminDashboard initialized');
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    console.log('Loading products...');
    this.productService.getAll().subscribe({
      next: (p) => {
        console.log('Products loaded:', p.length);
        this.products = p;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.products = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories() {
    console.log('Loading categories...');
    this.productService.getAllCategories().subscribe({
      next: (c) => {
        console.log('Categories loaded:', c.length);
        this.categories = c;
        if (c.length > 0 && !this.form.category) {
          this.form.category = c[0].id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.categories = [];
        this.cdr.detectChanges();
      }
    });
  }

  get filteredProducts(): Product[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.products;
    return this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      this.getCatName(p.category).toLowerCase().includes(q)
    );
  }

  get inStockCount(): number {
    return this.products.filter(p => p.stock > 0).length;
  }

  get lowStockCount(): number {
    return this.products.filter(p => p.stock > 0 && p.stock <= 5).length;
  }

  getCatName(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat?.name ?? '—';
  }

  countByCategory(catId: number): number {
    return this.products.filter(p => p.category === catId).length;
  }

  stockBadge(stock: number): string {
    if (stock <= 0) return 'badge badge-zero';
    if (stock <= 5) return 'badge badge-low';
    return 'badge badge-stock';
  }

  openCreate() {
    this.editingId = null;
    this.form = { 
      name: '', 
      description: '', 
      price: 0, 
      stock: 0, 
      category: this.categories[0]?.id ?? 0 
    };
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
      category: p.category 
    };
    this.imageFile = null;
    this.showForm = true;
  }

  closeOnBackdrop(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showForm = false;
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
    }
  }

  save() {
    const fd = new FormData();
    fd.append('name', this.form.name);
    fd.append('description', this.form.description);
    fd.append('price', String(this.form.price));
    fd.append('stock', String(this.form.stock));
    fd.append('category', String(this.form.category));
    if (this.imageFile) {
      fd.append('image', this.imageFile, this.imageFile.name);
    }

    const req = this.editingId
      ? this.productService.update(this.editingId, fd)
      : this.productService.create(fd);

    req.subscribe({
      next: () => {
        console.log('Product saved successfully');
        this.showForm = false;
        this.loadProducts();
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error saving product:', err);
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete product?')) return;
    this.productService.delete(id).subscribe({
      next: () => {
        console.log('Product deleted successfully');
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
      }
    });
  }

  addCategory() {
    if (!this.newCatName.trim()) return;
    this.productService.createCategory(this.newCatName.trim()).subscribe({
      next: () => {
        console.log('Category added successfully');
        this.newCatName = '';
        this.loadCategories();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error adding category:', err);
      }
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Delete category?')) return;
    this.productService.deleteCategory(id).subscribe({
      next: () => {
        console.log('Category deleted successfully');
        this.loadCategories();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error deleting category:', err);
      }
    });
  }
}