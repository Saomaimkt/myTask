import Link from "next/link";
import { getMembers, deleteMember } from "@/lib/actions";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { redirect } from "next/navigation";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#10b981] to-[#34d399]">
            Nhân sự dự án
          </h1>
          <p className="text-text-muted mt-1">
            Quản lý những người tham gia và phụ trách công việc.
          </p>
        </div>
        <Link
          href="/members/new"
          className="flex items-center gap-2 bg-gradient-to-r from-[#10b981] to-[#34d399] hover:from-[#059669] hover:to-[#10b981] text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Thêm nhân sự</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.length === 0 ? (
          <div className="col-span-full py-12 text-center glass-panel rounded-2xl border border-border/50">
            <p className="text-text-muted">Chưa có nhân sự nào được thêm.</p>
            <Link
              href="/members/new"
              className="inline-block mt-4 text-[#10b981] hover:underline font-medium"
            >
              Thêm nhân sự đầu tiên
            </Link>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="glass-panel p-5 rounded-2xl border border-border/50 hover:border-[#10b981]/50 transition-all group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm"
                    style={{
                      backgroundColor: `${member.color}20`,
                      color: member.color,
                      border: `1px solid ${member.color}40`,
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">{member.name}</h3>
                    {member.role && (
                      <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {member.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 transition-all">
                  <Link
                    href={`/members/${member.id}/edit`}
                    className="text-text-muted hover:text-primary p-2 rounded-lg hover:bg-surface transition-all"
                    title="Sửa"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteMember(member.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-text-muted hover:text-danger p-2 rounded-lg hover:bg-danger/10 transition-all"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Đang phụ trách</span>
                  <span className="font-semibold text-text-main bg-surface px-2 py-1 rounded-md">
                    {member.assignedTasks.length} công việc
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
