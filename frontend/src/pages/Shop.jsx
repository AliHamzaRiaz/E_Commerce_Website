import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, Star, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { getDiscountPercent, getDisplayRating } from '../utils/pricing';
import toast from 'react-hot-toast';

const getColorImage = (product, color) => {
  const colorKey = product.colorImages
    ? Object.keys(product.colorImages).find(
        (k) => k.trim().toLowerCase() === String(color || '').trim().toLowerCase()
      )
    : null;
  if (colorKey && product.colorImages[colorKey]) {
    const imgs = product.colorImages[colorKey];
    return Array.isArray(imgs) ? imgs[0] : imgs;
  }
  return product.image;
};

const ProductCard = ({ product, addToCart }) => {
  const colors = Array.isArray(product.colors) && product.colors.length ? product.colors : ['Default'];
  const sizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ['One Size'];
  const [activeColor, setActiveColor] = useState(colors[0]);
  const [variantStart, setVariantStart] = useState(0);
  const discount = getDiscountPercent(product);
  const rating = getDisplayRating(product.id);
  const isNew = String(product.discount || '').toLowerCase().includes('new') || discount >= 40;
  const displayImage = getColorImage(product, activeColor);
  const visibleColors = colors.slice(variantStart, variantStart + 4);

  const quickBuy = () => {
    addToCart(product, activeColor, sizes[0], 1, displayImage);
    toast.success('Added to cart');
  };

  return (
    <div className="group bg-white border border-neutral-100 rounded-xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/5] bg-neutral-50 overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {discount > 0 ? (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {discount}% OFF
          </span>
        ) : null}
        <span className="absolute top-3 right-3 bg-white text-black text-[10px] font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 shadow-sm">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          {rating}
        </span>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/product/${product.id}`} className="text-sm font-bold text-black hover:underline">
              {product.name}
            </Link>
            {isNew ? (
              <span className="bg-black text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                NEW
              </span>
            ) : null}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {product.type || product.category || 'Fashion'}
          </p>
        </div>

        {colors.length > 1 ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={variantStart <= 0}
              onClick={() => setVariantStart((v) => Math.max(0, v - 1))}
              className="p-1 text-neutral-400 disabled:opacity-30"
              aria-label="Previous variants"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex gap-1.5 overflow-hidden">
              {visibleColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveColor(c)}
                  className={`w-9 h-9 rounded-md overflow-hidden border ${
                    String(activeColor).toLowerCase() === String(c).toLowerCase()
                      ? 'border-black'
                      : 'border-neutral-200'
                  }`}
                  title={c}
                >
                  <img src={getColorImage(product, c)} alt={c} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={variantStart + 4 >= colors.length}
              onClick={() => setVariantStart((v) => Math.min(colors.length - 4, v + 1))}
              className="p-1 text-neutral-400 disabled:opacity-30"
              aria-label="Next variants"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-3 mt-auto pt-1">
          {Number(product.originalPrice) > Number(product.price) ? (
            <span className="text-xs text-neutral-400 line-through">
              Rs. {Number(product.originalPrice).toLocaleString()}
            </span>
          ) : (
            <span />
          )}
          <span className="text-base font-bold text-black">
            Rs. {Number(product.price || 0).toLocaleString()}
          </span>
        </div>

        <button
          type="button"
          onClick={quickBuy}
          className="w-full bg-black text-white text-[10px] font-bold uppercase tracking-[0.18em] py-3.5 hover:bg-neutral-800 transition-colors"
        >
          Quick Buy
        </button>
      </div>
    </div>
  );
};

const Shop = () => {
  const { addToCart } = useCart();
  const { products, isLoading: productsLoading } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});

  const loading = productsLoading || categoriesLoading;

  const selectedCategory = useMemo(() => {
    const c = String(searchParams.get('category') || '').trim();
    if (!c || c.toLowerCase() === 'all') return 'All';
    const match = categories.find((cat) => cat.displayName.toLowerCase() === c.toLowerCase());
    return match ? match.displayName : c;
  }, [searchParams, categories]);

  const searchQuery = useMemo(() => String(searchParams.get('search') || '').trim(), [searchParams]);

  const selectedType = useMemo(() => {
    const t = String(searchParams.get('type') || '').trim();
    if (!t) return '';
    const catData = categories.find((c) => c.displayName === selectedCategory);
    if (catData?.types) {
      const match = catData.types.find((type) =>
        String(type?.name || type)
          .toLowerCase()
          .includes(t.toLowerCase())
      );
      return match ? match.name || match : t;
    }
    return t;
  }, [searchParams, categories, selectedCategory]);

  const availableFilters = useMemo(() => {
    const colors = new Set();
    const sizes = new Set();
    const variations = {};
    products.forEach((p) => {
      const pCat = String(p.category || '').toLowerCase();
      const sCat = String(selectedCategory || '').toLowerCase();
      if (pCat === sCat || sCat === 'all') {
        (p.colors || []).forEach((c) => colors.add(c));
        (p.sizes || []).forEach((s) => sizes.add(s));
        if (p.variations) {
          Object.entries(p.variations).forEach(([key, vals]) => {
            if (!variations[key]) variations[key] = new Set();
            (Array.isArray(vals) ? vals : []).forEach((v) => variations[key].add(v));
          });
        }
      }
    });
    const finalVariations = {};
    Object.entries(variations).forEach(([key, set]) => {
      finalVariations[key] = Array.from(set).sort();
    });
    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      variations: finalVariations,
    };
  }, [products, selectedCategory]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          (p.description || '').toLowerCase().includes(query) ||
          (p.category || '').toLowerCase().includes(query) ||
          (p.type || '').toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => String(p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedType) {
      result = result.filter(
        (p) => String(p.type || '').toLowerCase() === String(selectedType).toLowerCase()
      );
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) => (p.colors || []).some((c) => selectedColors.includes(c)));
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) => (p.sizes || []).some((s) => selectedSizes.includes(s)));
    }

    Object.entries(selectedVariations).forEach(([key, selectedVals]) => {
      if (selectedVals.length > 0) {
        result = result.filter((p) => {
          const productVals = p.variations?.[key] || [];
          return (Array.isArray(productVals) ? productVals : []).some((v) =>
            selectedVals.includes(v)
          );
        });
      }
    });

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter((p) => p.price >= min && (max ? p.price <= max : true));
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') result.sort((a, b) => String(b.id).localeCompare(String(a.id)));

    return result;
  }, [
    products,
    selectedCategory,
    selectedType,
    selectedColors,
    selectedSizes,
    selectedVariations,
    priceRange,
    sortBy,
    searchQuery,
  ]);

  const pageTitle = searchQuery
    ? `Search: ${searchQuery}`
    : selectedCategory === 'All'
      ? 'All Products'
      : selectedCategory;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14">
        <div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-black">
            {pageTitle}
          </h1>
          <p className="text-sm text-neutral-400 shrink-0 pb-1">
            {filteredAndSortedProducts.length} products
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-5">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-2 border border-neutral-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-black transition-colors"
          >
            <Filter size={14} />
            Filter
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-neutral-300 rounded-md px-4 py-2.5 text-sm bg-white outline-none focus:border-black"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {showFilters ? (
          <div className="mb-8 border border-neutral-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-6 bg-neutral-50">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('category');
                    setSearchParams(next);
                  }}
                  className={`text-xs px-3 py-1.5 border rounded-full ${
                    selectedCategory === 'All' ? 'bg-black text-white border-black' : 'border-neutral-300'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('category', cat.displayName);
                      setSearchParams(next);
                    }}
                    className={`text-xs px-3 py-1.5 border rounded-full ${
                      selectedCategory === cat.displayName
                        ? 'bg-black text-white border-black'
                        : 'border-neutral-300'
                    }`}
                  >
                    {cat.displayName}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Price</p>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="all">All prices</option>
                <option value="0-2000">Under Rs 2,000</option>
                <option value="2000-5000">Rs 2,000 – 5,000</option>
                <option value="5000-15000">Rs 5,000 – 15,000</option>
                <option value="15000-">Over Rs 15,000</option>
              </select>
            </div>

            {availableFilters.colors.length > 0 ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Color</p>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setSelectedColors((prev) =>
                          prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
                        )
                      }
                      className={`text-xs px-3 py-1.5 border rounded-full ${
                        selectedColors.includes(color)
                          ? 'bg-black text-white border-black'
                          : 'border-neutral-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {availableFilters.sizes.length > 0 ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {availableFilters.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setSelectedSizes((prev) =>
                          prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                        )
                      }
                      className={`text-xs px-3 py-1.5 border rounded-full ${
                        selectedSizes.includes(size)
                          ? 'bg-black text-white border-black'
                          : 'border-neutral-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="md:col-span-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedColors([]);
                  setSelectedSizes([]);
                  setSelectedVariations({});
                  setPriceRange('all');
                  setShowFilters(false);
                }}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black"
              >
                <X size={14} /> Clear filters
              </button>
            </div>
          </div>
        ) : null}

        {filteredAndSortedProducts.length === 0 ? (
          <div className="py-24 text-center text-neutral-400">
            <p className="text-lg">No products found</p>
            <Link to="/shop" className="inline-block mt-4 text-sm font-bold underline underline-offset-4">
              View all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
