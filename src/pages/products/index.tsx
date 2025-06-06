import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { productFormSchema, type ProductFormSchema } from "@/forms/product";
import { zodResolver } from "@hookform/resolvers/zod";

const ProductsPage: NextPageWithLayout = () => {
  const [open, setOpen] = useState(false);
  const apiUtils = api.useUtils();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });
  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();
      alert("berhasil gess");
      setOpen(false);
      createProductForm.reset();
    },
  });

  const handleSubmitCreateProduct = (values: ProductFormSchema) => {
    if (!uploadedImageUrl) {
      alert("upload image first");
      return;
    }
    console.log(values);
    createProduct({
      ...values,
      imageUrl: uploadedImageUrl,
    });
  };
  const { data: products } = api.product.getProducts.useQuery();

  const { mutate: deleteProductById } =
    api.product.deleteProductById.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();
        alert("Product deleted successfully");
        setProductToDelete(null);
      },
    });
  const handleClickDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
  };

  const handleCofirmDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProductById({
      productId: productToDelete,
    });
  };
  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>Create Product</AlertDialogHeader>
              <Form {...createProductForm}>
                <ProductForm
                  onSubmit={handleSubmitCreateProduct}
                  onChangeImageUrl={(imageUrl) => setUploadedImageUrl(imageUrl)}
                />
              </Form>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => createProductForm.reset()}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  form="formProduct"
                  onClick={createProductForm.handleSubmit(
                    handleSubmitCreateProduct,
                  )}
                >
                  Create
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl ?? ""}
            category={product.category.name}
            onEdit={() => void 0}
            onDelete={() => handleClickDeleteProduct(product.id)}
          />
        ))}
      </div>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleCofirmDeleteProduct}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
