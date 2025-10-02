"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useCampaignApply } from "@/features/campaign/hooks/useCampaignApply";
import { isAfterDate, isFutureDate } from "@/lib/validation-utils";

type CampaignApplyFormProps = {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recruitmentEnd: string;
};

const createFormSchema = (recruitmentEnd: string) =>
  z.object({
    message: z
      .string()
      .min(10, "각오 한마디는 최소 10자 이상 입력해주세요")
      .max(500, "각오 한마디는 최대 500자까지 입력 가능합니다"),
    visitDate: z
      .string()
      .refine((date) => isFutureDate(date), {
        message: "오늘 이후 날짜를 선택해주세요",
      })
      .refine((date) => isAfterDate(date, recruitmentEnd), {
        message: "모집 종료일 이후 날짜를 선택해주세요",
      }),
  });

export function CampaignApplyForm({
  campaignId,
  open,
  onOpenChange,
  recruitmentEnd,
}: CampaignApplyFormProps) {
  const { mutate: applyToCampaign, isPending } = useCampaignApply(campaignId);

  const formSchema = createFormSchema(recruitmentEnd);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      visitDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    },
  });

  const onSubmit = (data: FormValues) => {
    applyToCampaign(data, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      if (!newOpen) {
        form.reset();
      }
      onOpenChange(newOpen);
    }
  };

  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>체험단 지원하기</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>각오 한마디</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="각오 한마디를 입력하세요"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    10자 이상 500자 이하로 입력해주세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="visitDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>방문 예정일</FormLabel>
                  <FormControl>
                    <Input type="date" min={tomorrow} {...field} />
                  </FormControl>
                  <FormDescription>
                    방문 예정일을 선택해주세요 (모집 종료일 이후)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "지원 중..." : "지원하기"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
