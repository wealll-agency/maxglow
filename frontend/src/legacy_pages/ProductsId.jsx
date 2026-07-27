

export default function ProductDetailsRedirectPage({ params }) {
  redirect(`/shop-details?id=${params.id}`);
}
