import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category } from '../../services/product';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, SlicePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  private productService = inject(ProductService);

  showForm = false;
  showCatForm = false
  editingId: number | null = null;
  searchQuery = '';
  newCatName = '';

  form = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 0,
  };
  imageFile: File | null = null;

  // ── Lifecycle ──────────────────────────────────

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  // ── Data loading ───────────────────────────────

  loadProducts() {
    this.productService.getAll().subscribe(p => (this.products = p));
  }

  loadCategories() {
    this.productService.getAllCategories().subscribe(c => {
      this.categories = c;
      if (c.length > 0 && !this.form.category) {
        this.form.category = c[0].id;
      }
    });
  }

  // ── Computed ───────────────────────────────────

  get filteredProducts(): Product[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.products;
    return this.products.filter(
      p =>
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

  // ── Helpers ────────────────────────────────────

  getCatName(id: number): string {
    return this.categories.find(c => c.id === id)?.name ?? '—';
  }

  countByCategory(catId: number): number {
    return this.products.filter(p => p.category === catId).length;
  }

  stockBadge(stock: number): string {
    if (stock <= 0) return 'badge badge-zero';
    if (stock <= 5) return 'badge badge-low';
    return 'badge badge-stock';
  }

  // ── Form control ───────────────────────────────

  openCreate() {
    this.editingId = null;
    this.form = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: this.categories[0]?.id ?? 0,
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
      category: p.category,
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
    this.imageFile = input.files?.[0] ?? null;
  }

  // ── CRUD ───────────────────────────────────────

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
      this.loadProducts();
    });
  }

  delete(id: number) {
    if (!confirm('Удалить товар?')) return;
    this.productService.delete(id).subscribe(() => this.loadProducts());
  }

  // ── Categories ─────────────────────────────────

  addCategory() {
    if (!this.newCatName.trim()) return;
    this.productService.createCategory(this.newCatName.trim()).subscribe(() => {
      this.newCatName = '';
      this.loadCategories();
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Удалить категорию?')) return;
    this.productService.deleteCategory(id).subscribe(() => this.loadCategories());
  }

  isDarkMode = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

}