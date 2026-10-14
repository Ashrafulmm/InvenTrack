import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Package } from 'lucide-react';
import { Product } from '../store/DataContext';

interface SearchableProductSelectProps {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
  placeholder?: string;
  currencySymbol?: string;
  showStock?: boolean;
  onlyInStock?: boolean;
  disabled?: boolean;
}

export default function SearchableProductSelect({
  products,
  value,
  onChange,
  placeholder = 'Search product by name or SKU...',
  currencySymbol = '৳',
  showStock = true,
  onlyInStock = false,
  disabled = false,
}: SearchableProductSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products
    .filter(p => {
      if (onlyInStock && p.stock <= 0) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    })
    .slice(0, 50); // Limit for performance

  const selectedProduct = products.find(p => p.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [query]);

  const handleSelect = (product: Product) => {
    onChange(product.id);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev => (prev + 1) % filteredProducts.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && filteredProducts[highlightIndex]) {
          handleSelect(filteredProducts[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : (selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : '')}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        {selectedProduct && !isOpen && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              {query ? 'No products found' : 'No products available'}
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>{filteredProducts.length} {filteredProducts.length === 50 ? '+' : ''} results</span>
                <span>Use ↑↓ to navigate</span>
              </div>
              {filteredProducts.map((product, idx) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`w-full px-3 py-2 text-left border-b border-gray-50 last:border-0 transition-colors ${
                    highlightIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-gray-500">{product.sku}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{product.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-blue-600">{currencySymbol}{product.price.toFixed(2)}</p>
                      {showStock && (
                        <p className={`text-xs ${product.stock <= product.min_stock ? 'text-red-600' : 'text-gray-500'}`}>
                          Stock: {product.stock}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
