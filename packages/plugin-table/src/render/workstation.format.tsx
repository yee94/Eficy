import { EmployeePreview } from '@alife/employee-components';
import { SellerPreview, SellerPreviewCard } from '@alife/ws-seller-preview';
import { ComponentProps } from 'react';
import { formatRender } from './format-render';
import type { RenderHelpers, RendererFunction } from './type';

export const WorkstationFormatRender = formatRender.register({
  // EmployeePreview 的 Props 类型会自动推断为 empId 和其他属性
  Employee: ((helpers: RenderHelpers) => (workNo: string) => {
    if (!workNo) {
      return helpers.renderEmpty();
    }
    return <EmployeePreview empId={workNo} {...helpers.columnArgs} />;
  }) as RendererFunction<ComponentProps<typeof EmployeePreview>>,

  // SellerPreview 的 Props 类型会自动推断为 sellerId 和其他属性
  SellerInfo: ((helpers: RenderHelpers) => (shortCode: string) => {
    if (!shortCode) {
      return helpers.renderEmpty();
    }
    return <SellerPreview sellerId={shortCode} {...helpers.columnArgs} />;
  }) as RendererFunction<ComponentProps<typeof SellerPreview>>,

  // SellerPreviewCard 的 Props 类型会自动推断为 sellerId、pure 和其他属性
  SellerCard: ((helpers: RenderHelpers) => (shortCode: string) => {
    if (!shortCode) {
      return helpers.renderEmpty();
    }
    return <SellerPreviewCard pure sellerId={shortCode} {...helpers.columnArgs} />;
  }) as RendererFunction<ComponentProps<typeof SellerPreviewCard>>,
});
