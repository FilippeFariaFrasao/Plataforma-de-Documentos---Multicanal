import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if categories already exist
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (existingCategories && existingCategories.length > 0) {
      return NextResponse.json(
        { message: "Data already seeded" },
        { status: 200 },
      );
    }

    // Insert categories
    const categories = [
      {
        name: "Invoicing",
        description: "Billing and invoice related procedures",
      },
      {
        name: "Inventory",
        description: "Inventory management and stock control",
      },
      { name: "Operations", description: "Day-to-day operational procedures" },
      { name: "HR", description: "Human resources policies and procedures" },
      { name: "IT", description: "IT systems and technical documentation" },
    ];

    const { data: insertedCategories, error: categoriesError } = await supabase
      .from("categories")
      .insert(categories)
      .select();

    if (categoriesError) {
      throw categoriesError;
    }

    // Get admin user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "No authenticated user found" },
        { status: 401 },
      );
    }

    // Insert sample documents
    const documents = [
      {
        title: "Invoice Generation Process",
        description: "Step-by-step guide for generating customer invoices",
        content:
          "# Invoice Generation Process\n\n## Overview\nThis document outlines the standard procedure for generating customer invoices in our system.\n\n## Steps\n1. Log into the billing system\n2. Navigate to 'New Invoice'\n3. Select the customer from the dropdown\n4. Add line items for products/services\n5. Apply any discounts or special terms\n6. Review for accuracy\n7. Click 'Generate Invoice'\n8. Send to customer via email or print for mailing\n\n## Notes\n- Always double-check amounts before finalizing\n- For special pricing, get manager approval\n- Invoices should be generated within 24 hours of service completion",
        category_id: insertedCategories?.[0]?.id,
        created_by: user.id,
      },
      {
        title: "Inventory Reconciliation Procedure",
        description:
          "Monthly process for reconciling physical inventory with system records",
        content:
          "# Inventory Reconciliation Procedure\n\n## Purpose\nTo ensure accuracy between physical inventory and system records.\n\n## Frequency\nThis procedure should be performed on the last Friday of each month.\n\n## Process\n1. Generate inventory report from system\n2. Print count sheets by location\n3. Perform physical count of all items\n4. Record counts on sheets\n5. Enter physical counts into system\n6. Run variance report\n7. Investigate any variances over 5%\n8. Make necessary adjustments with manager approval\n9. Document findings and resolutions\n10. Submit final report to Finance department\n\n## Required Materials\n- Count sheets\n- Barcode scanner\n- Inventory adjustment forms",
        category_id: insertedCategories?.[1]?.id,
        created_by: user.id,
      },
      {
        title: "Customer Return Policy",
        description:
          "Official policy for handling customer returns and exchanges",
        content:
          "# Customer Return Policy\n\n## Return Window\nCustomers may return products within 30 days of purchase with receipt.\n\n## Condition Requirements\nItems must be in original packaging and unused condition.\n\n## Refund Methods\n- Original payment method for returns with receipt\n- Store credit for returns without receipt (manager approval required)\n\n## Non-Returnable Items\n- Custom orders\n- Clearance items (marked as final sale)\n- Opened software or digital products\n\n## Exchange Process\n1. Verify purchase with receipt or in system\n2. Inspect returned item condition\n3. Process return in POS system\n4. Issue refund or process exchange\n5. Restock or mark for disposal as appropriate\n\n## Manager Override\nRequired for:\n- Returns beyond 30 days\n- Returns without receipt over $50\n- Any exceptions to standard policy",
        category_id: insertedCategories?.[2]?.id,
        created_by: user.id,
      },
    ];

    const { error: documentsError } = await supabase
      .from("documents")
      .insert(documents);

    if (documentsError) {
      throw documentsError;
    }

    return NextResponse.json(
      { message: "Data seeded successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error seeding data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
